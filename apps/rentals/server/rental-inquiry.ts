import {mkdir, writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import nodemailer from 'nodemailer';
import type {Plugin} from 'vite';
import type {RentalInquiry} from '../src/RentalsApp';

const recipient = 'ruviblooms@gmail.com';
const maxBytes = 24_000;

function validText(value: unknown, max: number, required = false): value is string {
  return typeof value === 'string' && value.length <= max && (!required || Boolean(value.trim()));
}

function isInquiry(value: unknown): value is RentalInquiry {
  if (!value || typeof value !== 'object') return false;
  const inquiry = value as Partial<RentalInquiry>;
  return validText(inquiry.name, 100, true) && validText(inquiry.email, 150, true)
    && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(inquiry.email)
    && validText(inquiry.phone, 40) && validText(inquiry.venue, 150)
    && validText(inquiry.eventDate, 10) && (!inquiry.eventDate || /^\d{4}-\d{2}-\d{2}$/.test(inquiry.eventDate))
    && Array.isArray(inquiry.items) && inquiry.items.length > 0 && inquiry.items.length <= 50
    && inquiry.items.every(item => item && validText(item.id, 100, true) && validText(item.name, 150, true)
      && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 999
      && (item.samplePrice === undefined || (Number.isFinite(item.samplePrice) && item.samplePrice >= 0 && item.samplePrice <= 100_000)));
}

const price = new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD', currencyDisplay: 'code'});

export function rentalInquiryPlugin(env: Record<string, string>): Plugin {
  const mode = env.RENTAL_MAIL_MODE || 'capture';
  // Keep sender configuration and captured messages entirely on the local server.
  const transport = mode === 'smtp'
    ? nodemailer.createTransport({
        host: env.RENTAL_SMTP_HOST,
        port: Number(env.RENTAL_SMTP_PORT || 587),
        secure: env.RENTAL_SMTP_PORT === '465',
        requireTLS: env.RENTAL_SMTP_PORT !== '465',
        auth: {user: env.RENTAL_SMTP_USER, pass: env.RENTAL_SMTP_PASSWORD},
        connectionTimeout: 8_000, greetingTimeout: 8_000, socketTimeout: 15_000,
      })
    : nodemailer.createTransport({streamTransport: true, buffer: true, newline: 'windows'});

  const middleware: import('vite').Connect.NextHandleFunction = async (request, response, next) => {
    if (request.url?.split('?')[0] !== '/api/rental-inquiry') return next();

    const reply = (status: number, data: object) => {
      response.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
      response.end(JSON.stringify(data));
    };

    if (request.method !== 'POST') return reply(405, {error: 'Use POST to submit an inquiry.'});
    if (request.headers.origin && !['http://', 'https://'].some(scheme => request.headers.origin === scheme + request.headers.host)) {
      return reply(403, {error: 'Submit the inquiry from the rentals preview.'});
    }
    if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
      return reply(415, {error: 'Expected a JSON inquiry.'});
    }
    if (Number(request.headers['content-length']) > maxBytes) return reply(413, {error: 'The inquiry is too large.'});

    let payload: unknown;
    try {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > maxBytes) return reply(413, {error: 'The inquiry is too large.'});
        chunks.push(chunk);
      }
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return reply(400, {error: 'The inquiry could not be read.'});
    }
    if (!isInquiry(payload)) return reply(400, {error: 'Check the contact details and rental quantities.'});

    if (mode !== 'capture' && (mode !== 'smtp' || !env.RENTAL_SMTP_HOST || !env.RENTAL_SMTP_USER || !env.RENTAL_SMTP_PASSWORD)) {
      return reply(503, {error: 'Inquiry email is not configured on the local server.'});
    }

    const items = payload.items.map(item => item.quantity + ' × ' + item.name +
      (item.samplePrice === undefined ? '' : ' · ' + price.format(item.samplePrice) + ' each (sample)'));
    const subtotal = payload.items.reduce((sum, item) => sum + item.quantity * (item.samplePrice ?? 0), 0);
    try {
      const info = await transport.sendMail({
        from: env.RENTAL_MAIL_FROM || (mode === 'smtp' ? env.RENTAL_SMTP_USER : 'Ruvi Blooms Local <rentals@example.invalid>'),
        to: recipient,
        replyTo: payload.email,
        subject: 'Ruvi Blooms rental inquiry',
        text: ['Name: ' + payload.name, 'Email: ' + payload.email,
          ...(payload.phone ? ['Phone: ' + payload.phone] : []),
          ...(payload.eventDate ? ['Event date: ' + payload.eventDate] : []),
          ...(payload.venue ? ['Venue or city: ' + payload.venue] : []),
          '', 'Selected rentals', ...items,
          ...(subtotal ? ['', 'Sample subtotal: ' + price.format(subtotal)] : []),
        ].join('\n'),
      });
      if (mode === 'capture') {
        const folder = resolve('.rental-inquiries');
        await mkdir(folder, {recursive: true});
        await writeFile(resolve(folder, randomUUID() + '.eml'), info.message, {flag: 'wx', mode: 0o600});
      }
      reply(200, {mode});
    } catch {
      reply(502, {error: 'Your inquiry could not be sent. Your details are still in the form. Please try again.'});
    }
  };

  return {
    name: 'ruvi-rental-inquiry-local',
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}
