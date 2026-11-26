import {createRoot} from 'react-dom/client';
import {RentalsApp, type RentalInquiry} from 'ruvi-blooms-rentals/react';

async function sendViaWeb3Forms(inquiry: RentalInquiry, accessKey: string) {
  const {items, name, email, phone, eventDate, venue} = inquiry;
  const formatPrice = new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD', currencyDisplay: 'code'}).format;
  const lines = items.map(({name, quantity, samplePrice}) => quantity + ' × ' + name +
    (samplePrice === undefined ? '' : ' · ' + formatPrice(samplePrice) + ' each (sample)'));
  const subtotal = items.reduce((sum, item) => sum + item.quantity * (item.samplePrice ?? 0), 0);
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({
      access_key: accessKey, subject: 'Ruvi Blooms rental inquiry', from_name: 'Ruvi Blooms Rentals',
      name, email, ...(phone && {phone}), ...(eventDate && {event_date: eventDate}), ...(venue && {venue}),
      message: ['Selected rentals', ...lines,
        ...(subtotal ? ['', 'Sample subtotal: ' + formatPrice(subtotal)] : []),
      ].join('\n'),
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => {
    throw new Error('We couldn’t reach the inquiry service. Your details are still in the form.');
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true) {
    throw new Error('Your inquiry could not be sent. Your details are still in the form. Please try again.');
  }
  return 'Your rental inquiry was sent.';
}

async function sendInquiry(inquiry: RentalInquiry) {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
  if (accessKey) return sendViaWeb3Forms(inquiry, accessKey);
  const response = await fetch('/api/rental-inquiry', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(inquiry),
  }).catch(() => {
    throw new Error('Unable to reach the local inquiry server. Please try again.');
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new Error(result?.error || 'The local inquiry server is unavailable. Please try again.');
  }
  return result.mode === 'capture'
    ? 'Test inquiry saved locally. No email was sent.'
    : 'Your rental inquiry was sent.';
}

createRoot(document.getElementById('root')!).render(
  <RentalsApp
    onInquiry={sendInquiry}
    whatsappUrl={import.meta.env.VITE_WHATSAPP_URL?.trim()}
    instagramUrl={import.meta.env.VITE_INSTAGRAM_URL?.trim()}
  />,
);
