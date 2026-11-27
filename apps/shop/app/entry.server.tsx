import {renderToReadableStream} from 'react-dom/server';
import {ServerRouter, type EntryContext} from 'react-router';
import {isbot} from 'isbot';

export const streamTimeout = 5_000;

export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
) {
  if (request.method === 'HEAD') return new Response(null, {status, headers});

  const body = await renderToReadableStream(
    <ServerRouter context={context} url={request.url} />,
    {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(streamTimeout + 1_000)]),
      onError(error) {
        status = 500;
        if (!request.signal.aborted) console.error(error);
      },
    },
  );
  if (context.isSpaMode || isbot(request.headers.get('user-agent') ?? '')) await body.allReady;
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(body, {status, headers});
}
