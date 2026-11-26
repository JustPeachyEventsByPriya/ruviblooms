import {createCartCookie, createCartServerHandlers, getCartId} from '@shopify/hydrogen';
import {createCookie, data, redirect, redirectDocument} from 'react-router';
import type {Money} from './catalog';
import {demoProducts} from './demo.server';
import {buyerCountry, storefront} from './storefront.server';
import {CART_BUYER_UPDATE, CART_CREATE, CART_FRAGMENT} from './cart-operations.server';

const handlers = createCartServerHandlers({fragment: CART_FRAGMENT});
type LiveStore = NonNullable<ReturnType<typeof storefront>>;
const demoCookie = createCookie('ruvi_demo_cart', {httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 14});
const cartHeaders = {'Cache-Control': 'private, no-store', 'Referrer-Policy': 'same-origin'};
const quantityLimit = 99;
const demoMerchandise = demoProducts.flatMap(({handle, title, variants}) => variants.map(variant => ({
  handle, title, variant, showVariant: variants.length > 1,
})));
type Line = {id: string; title: string; variant?: string; handle?: string; quantity: number; total: Money; unavailable?: boolean};
type Basket = {lines: Line[]; subtotal: Money | null; canCheckout: boolean; expired?: boolean};
type Change = {intent: 'add'; merchandiseId: string; quantity: number}
  | {intent: 'set'; lineId: string; quantity: number}
  | {intent: 'remove'; lineId: string};

function problem(message: string, status = 400) {
  return data({message}, {status, headers: cartHeaders});
}

async function demoQuantities(request: Request) {
  const values: unknown = await demoCookie.parse(request.headers.get('Cookie'));
  const quantities = new Map<string, number>();
  if (!values || typeof values !== 'object') return quantities;
  for (const {variant} of demoMerchandise) {
    const quantity = Object.getOwnPropertyDescriptor(values, variant.id)?.value;
    if (Number.isInteger(quantity) && quantity > 0 && quantity <= quantityLimit) {
      quantities.set(variant.id, quantity);
    }
  }
  return quantities;
}

function readChange(form: FormData): Change | null {
  const intent = form.get('intent');
  const raw = form.get('quantity');
  const quantity = typeof raw === 'string' && /^\d{1,2}$/.test(raw) ? Number(raw) : 0;
  if (intent === 'add') {
    const merchandiseId = form.get('merchandiseId');
    return typeof merchandiseId === 'string' && merchandiseId.length <= 200 && quantity > 0
      ? {intent, merchandiseId, quantity} : null;
  }
  const lineId = form.get('lineId');
  if (typeof lineId !== 'string' || !lineId || lineId.length > 1000) return null;
  if (intent === 'remove') return {intent, lineId};
  return intent === 'set' && quantity > 0 ? {intent, lineId, quantity} : null;
}

function liveHeaders(request: Request, init?: HeadersInit) {
  const headers = new Headers(init);
  for (const [name, value] of Object.entries(cartHeaders)) headers.set(name, value);
  const cookies = headers.getSetCookie();
  if (cookies.length) {
    headers.delete('set-cookie');
    for (const value of cookies) {
      const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
      headers.append('set-cookie', value.startsWith('cart=') ? value + '; HttpOnly' + secure : value);
    }
  }
  return headers;
}

function cartStore(request: Request) {
  const url = new URL('/cart', request.url);
  return storefront(new Request(url, {headers: request.headers, signal: request.signal}));
}

function expireCart(headers: Headers, request: Request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  headers.append('Set-Cookie', 'cart=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' + secure);
}

async function sessionCart(shop: LiveStore) {
  const state = await handlers.get({storefrontClient: shop.client});
  if (state.data.errors?.length) throw new Error('Could not retrieve Shopify cart');
  const {cart} = state.data;
  if (!cart || cart.buyerIdentity.countryCode === buyerCountry) return state;

  const result = await shop.client.graphql(CART_BUYER_UPDATE, {
    variables: {cartId: cart.id, identity: {countryCode: buyerCountry}},
  });
  if (result.errors || !result.data?.cartBuyerIdentityUpdate?.cart || result.data.cartBuyerIdentityUpdate.userErrors.length) {
    throw new Error('Could not set Shopify cart buyer country');
  }

  const updated = await handlers.get({storefrontClient: shop.client});
  if (updated.data.errors?.length) throw new Error('Could not refresh Shopify cart');
  return updated;
}

function feedback(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values.flatMap((value: {message?: unknown; code?: unknown} | null) => (
    typeof value?.message === 'string' ? [{message: value.message, code: value.code}] : []
  ));
}

function mutationResponse(result: {userErrors?: unknown; warnings?: unknown}, headers: Headers) {
  const issues = [...feedback(result.userErrors), ...feedback(result.warnings)];
  if (!issues.length) return redirect('/cart', {status: 303, headers});
  const stock = issues.some(({code, message}) =>
    /STOCK|SOLD_OUT|UNAVAILABLE|NOT_ENOUGH/i.test(String(code)) || /stock|available|sold out/i.test(message));
  const message = issues.map(issue => issue.message).join(' ');
  return data({message, stock}, {headers});
}

export async function readBasket(request: Request) {
  const shop = cartStore(request);
  if (!shop) {
    const quantities = await demoQuantities(request);
    let cents = 0;
    const lines: Line[] = [];
    for (const {handle, title, variant, showVariant} of demoMerchandise) {
      const quantity = quantities.get(variant.id);
      if (!quantity) continue;
      const lineCents = Math.round(Number(variant.price.amount) * 100) * quantity;
      cents += lineCents;
      lines.push({
        id: variant.id, handle, title, quantity, variant: showVariant ? variant.title : undefined,
        total: {amount: (lineCents / 100).toFixed(2), currencyCode: 'CAD'},
      });
    }
    const basket: Basket = {lines, subtotal: {amount: (cents / 100).toFixed(2), currencyCode: 'CAD'}, canCheckout: false};
    return data({mock: true, basket}, {headers: cartHeaders});
  }

  // Read only the session cart. The SDK's GET handler also accepts explicit cartId parameters.
  const result = await sessionCart(shop).catch(() => {
    throw new Response('The bag is temporarily unavailable.', {status: 502, headers: cartHeaders});
  });
  const {cart} = result.data;
  const headers = liveHeaders(request, result.headers);
  const expired = !cart && Boolean(getCartId(shop.requestContext));
  if (expired) expireCart(headers, request);
  shop.requestContext.markResponseAsPersonalized('cart');
  shop.requestContext.applyResponseHeaders(headers);
  const basket: Basket = {
    lines: cart?.lines.nodes.map(({id, quantity, merchandise, cost}) => ({
      id, quantity, title: merchandise.product.title, handle: merchandise.product.handle,
      variant: merchandise.title, total: cost.totalAmount, unavailable: merchandise.availableForSale === false,
    })) ?? [],
    subtotal: cart?.cost.subtotalAmount ?? null,
    canCheckout: Boolean(cart?.totalQuantity && cart.checkoutUrl &&
      cart.lines.nodes.every(line => line.merchandise.availableForSale !== false)),
    expired,
  };
  return data({mock: false, basket}, {headers});
}

export async function changeBasket(request: Request) {
  const origin = request.headers.get('Origin');
  if (request.method !== 'POST' || (origin && origin !== new URL(request.url).origin)) {
    return problem('This bag request could not be accepted.', 403);
  }
  const form = await request.formData().catch(() => null);
  if (!form) return problem('The bag request was incomplete.');

  const shop = cartStore(request);
  try {
    if (form.get('intent') === 'checkout') {
      if (!shop) return problem('Checkout is unavailable in the mock catalog.', 409);
      const result = await sessionCart(shop);
      const {cart} = result.data;
      if (!cart && getCartId(shop.requestContext)) {
        const headers = liveHeaders(request, result.headers);
        expireCart(headers, request);
        return data({message: 'Your bag expired. Add your arrangements again to check out.'}, {status: 409, headers});
      }
      if (!cart?.totalQuantity || !cart.checkoutUrl) return problem('Add an item to your bag before checking out.', 409);
      if (cart.lines.nodes.some(line => line.merchandise.availableForSale === false)) {
        return data({message: 'Remove unavailable items before checking out.', stock: true}, {status: 409, headers: cartHeaders});
      }
      const checkout = new URL(cart.checkoutUrl);
      if (checkout.protocol !== 'https:') return problem('Shopify checkout is temporarily unavailable.', 502);
      const headers = liveHeaders(request, result.headers);
      shop.requestContext.applyResponseHeaders(headers);
      return redirectDocument(checkout.toString(), {status: 303, headers});
    }

    const change = readChange(form);
    if (!change) return problem('Choose an item and a quantity between 1 and 99.');
    if (!shop) {
      const quantities = await demoQuantities(request);
      if (change.intent === 'add') {
        if (!demoMerchandise.some(({variant}) => variant.id === change.merchandiseId)) {
          return problem('That preview item is unavailable.');
        }
        const quantity = (quantities.get(change.merchandiseId) ?? 0) + change.quantity;
        if (quantity > quantityLimit) return problem('The preview supports up to 99 units per item.');
        quantities.set(change.merchandiseId, quantity);
      } else if (change.intent === 'remove') {
        quantities.delete(change.lineId);
      } else if (quantities.has(change.lineId)) {
        quantities.set(change.lineId, change.quantity);
      }
      return redirect('/cart', {status: 303, headers: {
        ...cartHeaders,
        'Set-Cookie': await demoCookie.serialize(Object.fromEntries(quantities), {secure: new URL(request.url).protocol === 'https:'}),
      }});
    }

    if (change.intent === 'add' && !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(change.merchandiseId)) {
      return problem('Choose a valid product variant.');
    }
    const previousId = getCartId(shop.requestContext);
    const previous = previousId ? await sessionCart(shop) : null;
    if (!previous?.data.cart) {
      if (change.intent !== 'add') {
        const headers = liveHeaders(request, previous?.headers);
        if (previousId) expireCart(headers, request);
        return data({message: 'Your bag is no longer available. Add your arrangements again.'}, {status: 409, headers});
      }

      const result = await shop.client.graphql(CART_CREATE, {variables: {input: {
        buyerIdentity: {countryCode: buyerCountry},
        lines: [{merchandiseId: change.merchandiseId, quantity: change.quantity}],
      }}});
      const created = result.data?.cartCreate;
      if (result.errors || !created) throw new Error('Could not create Shopify cart');
      const headers = liveHeaders(request, result.headers);
      if (created.cart) {
        const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
        headers.append('Set-Cookie', createCartCookie(created.cart.id) + '; HttpOnly' + secure);
      } else if (previousId) {
        expireCart(headers, request);
      }
      shop.requestContext.applyResponseHeaders(headers);
      return mutationResponse(created, headers);
    }

    const payload = change.intent === 'add' ? {lines: [{merchandiseId: change.merchandiseId, quantity: change.quantity}]}
      : {lines: [{id: change.lineId, quantity: change.intent === 'remove' ? 0 : change.quantity}]};
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const cookie = request.headers.get('Cookie');
    if (cookie) headers.set('Cookie', cookie);
    const jsonRequest = new Request(request.url, {
      method: 'POST', headers, body: JSON.stringify(payload), signal: request.signal,
    });
    const result = await handlers.post({request: jsonRequest, storefrontClient: shop.client});
    const responseHeaders = liveHeaders(request, result.headers);
    shop.requestContext.applyResponseHeaders(responseHeaders);
    if (result.type !== 'json') return data({message: 'The bag changed. Review it and try again.'}, {status: 409, headers: responseHeaders});

    return mutationResponse(result.data, responseHeaders);
  } catch {
    return problem('The bag is temporarily unavailable. Try again shortly.', 502);
  }
}
