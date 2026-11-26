import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {after, beforeEach, test} from 'node:test';
import {buildClientSchema, parse, validate} from 'graphql';
import {createRequestHandler} from 'react-router';
import * as build from '../build/server/index.js';

const require = createRequire(import.meta.url);
const schema = buildClientSchema(require('@shopify/hydrogen/storefront.schema.json'), {assumeValid: true});
const storefrontDomain = 'ruvi-fixture.myshopify.com';
const token = 'fixture-public-token';
const variantId = 'gid://shopify/ProductVariant/101';
const outOfStockId = 'gid://shopify/ProductVariant/102';
const cartId = 'gid://shopify/Cart/fixture?key=fixture-secret';
const lineId = 'gid://shopify/CartLine/fixture';
const checkoutUrl = 'https://ruvi-fixture.myshopify.com/checkouts/test';
const base = 'http://localhost';
const handle = createRequestHandler(build, 'production');
const originalFetch = globalThis.fetch;
const env = {domain: process.env.PUBLIC_STORE_DOMAIN, token: process.env.PUBLIC_STOREFRONT_API_TOKEN};
const money = amount => ({amount: amount.toFixed(2), currencyCode: 'CAD'});
const image = {url: 'https://cdn.example.test/red.jpg', altText: 'Red arrangement', width: 1000, height: 1000};
const detailImage = {url: 'https://cdn.example.test/detail.jpg', altText: 'Arrangement detail', width: 1000, height: 800};
const product = {
  handle: 'fixture-arrangement', title: 'Test Arrangement', description: 'Fixture only.',
  featuredImage: image, images: {nodes: [image, detailImage]}, seo: {title: null, description: null},
  priceRange: {minVariantPrice: money(59), maxVariantPrice: money(79)},
  dimensions: {type: 'single_line_text_field', value: '18 × 12 in'},
  delivery: {type: 'multi_line_text_field', value: 'Packed in a protective box.'},
};
const variant = {id: variantId, title: 'Classic', availableForSale: true, price: money(59), image, dimensions: null};
const unavailableVariant = {...variant, id: outOfStockId, title: 'Grand', availableForSale: false,
  price: money(79), dimensions: {type: 'single_line_text_field', value: '24 × 18 in'}};
const pageInfo = {hasNextPage: false, endCursor: null};
const collection = {handle: 'fixture', title: 'Fixture collection', description: '', image, products: {nodes: [product], pageInfo}};
let fixture;

function cart() {
  const total = money(fixture.quantity * 59);
  return {
    id: cartId, buyerIdentity: {countryCode: fixture.country}, checkoutUrl, totalQuantity: fixture.quantity,
    cost: {subtotalAmount: total, totalAmount: total, checkoutChargeAmount: total},
    lines: {nodes: fixture.quantity ? [{id: lineId, quantity: fixture.quantity, cost: {totalAmount: total},
      merchandise: {...variant, availableForSale: !fixture.soldOut, product: {title: product.title, handle: product.handle}}}] : []},
  };
}

function respond(field, result) {
  return Response.json({data: {[field]: result}});
}

function mutation(field, warnings = []) {
  return respond(field, {cart: cart(), userErrors: [], warnings});
}

globalThis.fetch = async (input, init) => {
  const request = new Request(input, init);
  assert.equal(new URL(request.url).hostname, storefrontDomain, 'Tests must never contact a real store');
  assert.equal(new URL(request.url).pathname, '/api/2026-10/graphql.json');
  assert.equal(request.headers.get('X-Shopify-Storefront-Access-Token'), token);
  const {query, variables} = await request.json();
  const doc = parse(query);
  assert.deepEqual(validate(schema, doc).map(error => error.message), [], query);
  const name = doc.definitions.find(node => node.kind === 'OperationDefinition').name.value;
  fixture.requests.push({name, variables});
  switch (name) {
    case 'RuviCollections': return respond('collections', {nodes: [collection], pageInfo});
    case 'RuviCollection': return respond('collection', collection);
    case 'RuviProduct': {
      if (variables.handle === 'upstream-error') return Response.json({errors: [{message: 'Private failure context'}]});
      if (variables.handle === 'missing') return respond('product', null);
      const variants = variables.after
        ? {nodes: [unavailableVariant], pageInfo}
        : {nodes: [variant], pageInfo: {hasNextPage: true, endCursor: 'variant-cursor'}};
      return respond('product', {...product, variants});
    }
    case 'Cart':
      if (fixture.failReads) return Response.json({errors: [{message: 'Cart fixture interruption'}]});
      return respond('cart', variables.id === cartId && fixture.exists ? cart() : null);
    case 'CartCreate':
      fixture.country = variables.input.buyerIdentity.countryCode;
      fixture.quantity = variables.input.lines[0].quantity;
      fixture.exists = true;
      return mutation('cartCreate');
    case 'RuviCartBuyerUpdate':
      fixture.country = variables.identity.countryCode;
      return respond('cartBuyerIdentityUpdate', {cart: {id: cartId}, userErrors: []});
    case 'CartLinesAdd':
      fixture.quantity += variables.lines[0].quantity;
      return mutation('cartLinesAdd');
    case 'CartLinesUpdate':
      fixture.quantity = Math.min(variables.lines[0].quantity, fixture.stock);
      return mutation('cartLinesUpdate', variables.lines[0].quantity > fixture.stock
        ? [{code: 'MERCHANDISE_NOT_ENOUGH_STOCK', message: 'Only two arrangements are available.'}] : []);
    case 'CartLinesRemove':
      assert.deepEqual(variables.lineIds, [lineId]);
      fixture.quantity = 0;
      return mutation('cartLinesRemove');
    default: throw new Error('Unexpected operation ' + name);
  }
};

beforeEach(() => {
  process.env.PUBLIC_STORE_DOMAIN = storefrontDomain;
  process.env.PUBLIC_STOREFRONT_API_TOKEN = token;
  fixture = {exists: false, quantity: 0, stock: 99, country: null, soldOut: false, failReads: false, requests: []};
});

after(() => {
  globalThis.fetch = originalFetch;
  if (env.domain === undefined) delete process.env.PUBLIC_STORE_DOMAIN;
  else process.env.PUBLIC_STORE_DOMAIN = env.domain;
  if (env.token === undefined) delete process.env.PUBLIC_STOREFRONT_API_TOKEN;
  else process.env.PUBLIC_STOREFRONT_API_TOKEN = env.token;
});

function get(path, cookie) {
  return handle(new Request(base + path, {headers: cookie ? {Cookie: cookie} : {}}));
}

function post(fields, cookie) {
  return handle(new Request(base + '/cart', {method: 'POST', body: new URLSearchParams(fields), headers: cookie ? {Cookie: cookie} : {}}));
}

function sessionCookie(response) {
  const cookie = response.headers.getSetCookie().find(item => item.startsWith('cart='));
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  return cookie.split(';')[0];
}

async function add(quantity = 1, cookie) {
  return post({intent: 'add', merchandiseId: variantId, quantity: String(quantity)}, cookie);
}

async function html(response) {
  return (await response.text()).replaceAll(/<!--.*?-->/gs, '');
}

test('catalog operations use the configured schema and Canadian context and render a paginated, sold-out variant', async () => {
  assert.equal((await get('/collections')).status, 200);
  assert.equal((await get('/collections/fixture')).status, 200);
  const response = await get('/products/fixture-arrangement?variant=102');
  assert.equal(response.status, 200);
  const body = await html(response);
  assert.match(body, /Grand \(Sold out\)/);
  assert.match(body, /24 × 18 in/);
  assert.match(body, /Packed in a protective box/);
  assert.match(body, /View photo 2: Arrangement detail/);
  assert.match(body, />Sold out<\/button>/);
  assert(!body.includes(token));
  assert(fixture.requests.every(({variables}) => variables.country === 'CA'));
  assert(fixture.requests.some(({variables}) => variables.after === 'variant-cursor'));
  const available = await html(await get('/products/fixture-arrangement'));
  assert.match(available, /18 × 12 in/);
  assert.match(available, />Add to bag<\/button>/);
});

test('cart creates with Canadian identity, persists its cookie, and adds, updates and removes lines', async () => {
  const created = await add(2);
  assert.equal(created.status, 303);
  const cookie = sessionCookie(created);
  assert.equal(fixture.country, 'CA');
  assert.equal((await add(1, cookie)).status, 303);
  assert.equal(fixture.quantity, 3);
  const loaded = await get('/cart?cartId=other', cookie);
  assert.match(loaded.headers.get('Cache-Control'), /private.*no-store/);
  assert.equal(loaded.headers.get('Referrer-Policy'), 'same-origin');
  assert.match(await html(loaded), /CA\$177\.00/);
  assert.equal((await post({intent: 'set', lineId, quantity: '4'}, cookie)).status, 303);
  assert.equal(fixture.quantity, 4);
  assert.equal((await post({intent: 'remove', lineId}, cookie)).status, 303);
  assert.equal(fixture.quantity, 0);
  assert.match(await html(await get('/cart', cookie)), /Your bag is empty/);
});

test('expired cart is replaced on add and cleared on a read or stale line update', async () => {
  const expired = 'cart=expired';
  const loaded = await get('/cart', expired);
  assert.match(loaded.headers.getSetCookie().join(';'), /Max-Age=0/);
  assert.match(await html(loaded), /bag expired/i);
  const stale = await post({intent: 'set', lineId, quantity: '2'}, expired);
  assert.equal(stale.status, 409);
  assert.match(stale.headers.getSetCookie().join(';'), /Max-Age=0/);
  const replaced = await add(2, expired);
  assert.equal(replaced.status, 303);
  assert.notEqual(sessionCookie(replaced), expired);
  assert.equal(fixture.quantity, 2);
});

test('checkout syncs a legacy buyer country and redirects to Shopify without exposing cart keys in HTML', async () => {
  const cookie = sessionCookie(await add());
  fixture.country = 'US';
  const checkout = await post({intent: 'checkout'}, cookie);
  assert.equal(checkout.status, 303);
  assert.equal(checkout.headers.get('Location'), checkoutUrl);
  assert.equal(fixture.country, 'CA');
  assert.equal(fixture.requests.filter(item => item.name === 'RuviCartBuyerUpdate').length, 1);
  assert(!(await html(await get('/cart', cookie))).includes('fixture-secret'));
});

test('stock warnings surface adjusted quantities and unavailable lines block checkout', async () => {
  const cookie = sessionCookie(await add());
  fixture.stock = 2;
  const updated = await post({intent: 'set', lineId, quantity: '4'}, cookie);
  assert.equal(updated.status, 200);
  assert.match(await html(updated), /Only two arrangements are available/);
  assert.equal(fixture.quantity, 2);
  fixture.soldOut = true;
  const body = await html(await get('/cart', cookie));
  assert.match(body, /Unavailable. Remove this item/);
  assert(!body.includes('Continue to Shopify checkout'));
  assert.equal((await post({intent: 'checkout'}, cookie)).status, 409);
});

test('unknown products, API errors, invalid quantity and mock checkout render safe errors', async () => {
  assert.equal((await get('/products/missing')).status, 404);
  const upstream = await get('/products/upstream-error');
  assert.equal(upstream.status, 502);
  assert(!(await html(upstream)).includes('Private failure context'));
  const cookie = sessionCookie(await add());
  fixture.failReads = true;
  const error = await get('/cart', cookie);
  assert.equal(error.status, 502);
  assert.match(await html(error), /Retry bag/);
  assert.equal((await post({intent: 'add', merchandiseId: variantId, quantity: '100'})).status, 400);
  delete process.env.PUBLIC_STOREFRONT_API_TOKEN;
  assert.equal((await post({intent: 'checkout'})).status, 409);
});
