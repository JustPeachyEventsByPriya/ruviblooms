import {useEffect, useRef} from 'react';
import {Form, Link, useNavigation, type ShouldRevalidateFunctionArgs} from 'react-router';
import type {Route} from './+types/cart';
import {CatalogHeading, MockNotice} from '../components/catalog';
import {QuantityStepper} from '../components/quantity-stepper';
import {changeBasket, readBasket} from '../lib/cart.server';
import {money} from '../lib/catalog';

export const meta: Route.MetaFunction = () => [
  {title: 'Your Bag | Ruvi Blooms'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export const loader = ({request}: Route.LoaderArgs) => readBasket(request);
export const action = ({request}: Route.ActionArgs) => changeBasket(request);

export function shouldRevalidate({actionStatus, defaultShouldRevalidate}: ShouldRevalidateFunctionArgs) {
  return actionStatus === 409 || defaultShouldRevalidate;
}

export function ErrorBoundary() {
  return (
    <>
      <CatalogHeading title="Your bag" />
      <p role="alert" className="max-w-md text-muted">We couldn’t load your bag. Try again in a moment.</p>
      <Link reloadDocument className="gold-button mt-5" to="/cart">Retry bag</Link>
    </>
  );
}

export function headers({loaderHeaders, actionHeaders}: Route.HeadersArgs) {
  const result = new Headers(loaderHeaders);
  result.set('Cache-Control', 'private, no-store');
  result.set('Referrer-Policy', 'same-origin');
  for (const value of actionHeaders.getSetCookie()) result.append('Set-Cookie', value);
  return result;
}

export default function Cart({loaderData, actionData}: Route.ComponentProps) {
  const {mock, basket} = loaderData;
  const busy = useNavigation().state !== 'idle';
  const pendingRemoval = useRef<string | null>(null);
  const bagLines = useRef<HTMLUListElement>(null);
  const emptyBag = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (busy || !pendingRemoval.current) return;
    const removedId = pendingRemoval.current;
    pendingRemoval.current = null;
    if (basket.lines.some(line => line.id === removedId)) return;

    const target = bagLines.current?.querySelector<HTMLButtonElement>('[data-remove-line]') ?? emptyBag.current;
    target?.focus();
  }, [basket.lines, busy]);

  return (
    <>
      <CatalogHeading title="Your bag" />
      {mock && <MockNotice>Mock cart with sample prices. Checkout is unavailable in this preview.</MockNotice>}
      {actionData?.message && <p className="mb-6 border border-wine p-4 text-wine" role="alert">
        {'stock' in actionData && actionData.stock === true && <strong className="block">Stock update</strong>}
        {actionData.message}
      </p>}
      {basket.expired && !actionData?.message && <p className="mb-6 text-wine" role="status">Your previous bag expired. Add your arrangements again.</p>}
      {busy && <p className="mb-4 text-sm text-muted" role="status">Updating your bag…</p>}
      {basket.lines.length === 0 ? (
        <>
          <p ref={emptyBag} tabIndex={-1} className="text-muted">Your bag is empty.</p>
          <Link viewTransition to="/collections" className="gold-button mt-5">Explore collections</Link>
        </>
      ) : (
        <>
          <ul ref={bagLines} aria-busy={busy} className="divide-y divide-line border-y border-line">
            {basket.lines.map(line => (
              <li key={line.id} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  {line.handle ? <Link viewTransition className="font-semibold underline-offset-4 hover:underline" to={'/products/' + line.handle}>{line.title}</Link>
                    : <p className="font-semibold">{line.title}</p>}
                  {line.variant && <p className="text-sm text-muted">{line.variant}</p>}
                  {line.unavailable && <p className="mt-1 text-sm font-semibold text-wine">Unavailable. Remove this item to continue.</p>}
                </div>
                <Form method="post" viewTransition preventScrollReset className="flex flex-wrap items-end gap-3"
                  onSubmit={event => {
                    if (busy) event.preventDefault();
                  }}>
                  <input type="hidden" name="lineId" value={line.id} />
                  <QuantityStepper key={line.quantity} initial={line.quantity} disabled={busy || line.unavailable}
                    label={'Quantity for ' + [line.title, line.variant].filter(Boolean).join(', ')} />
                  <button className="min-h-11 px-1 text-sm underline aria-disabled:opacity-60" type="submit" name="intent" value="set" aria-disabled={busy} disabled={line.unavailable}>Update</button>
                  <button className="min-h-11 px-1 text-sm underline aria-disabled:opacity-60" type="submit" name="intent" value="remove"
                    aria-label={'Remove ' + [line.title, line.variant].filter(Boolean).join(', ')} aria-disabled={busy} formNoValidate data-remove-line
                    onClick={() => {
                      if (!busy) pendingRemoval.current = line.id;
                    }}>Remove</button>
                </Form>
                <p className="font-semibold">{money(line.total)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col items-start gap-4 sm:items-end">
            {basket.subtotal && <p aria-live="polite">Subtotal <strong key={basket.subtotal.amount} className="bag-summary inline-block">{money(basket.subtotal)}</strong></p>}
            {basket.canCheckout && (
              <Form method="post" reloadDocument>
                <button className="gold-button" name="intent" value="checkout" type="submit">Continue to Shopify checkout</button>
              </Form>
            )}
          </div>
        </>
      )}
    </>
  );
}
