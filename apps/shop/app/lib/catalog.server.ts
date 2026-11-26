import {gql} from '@shopify/hydrogen';
import {demoCollections, demoProducts} from './demo.server';
import {storefront} from './storefront.server';

const IMAGE = gql(`fragment RuviImage on Image { url altText width height }`);
const COLLECTION_CARD = gql(`
  fragment RuviCollectionCard on Collection {
    handle title description image { ...RuviImage }
  }
`);
const PRODUCT_CARD = gql(`
  fragment RuviProductCard on Product {
    handle title description featuredImage { ...RuviImage }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
  }
`);
export const COLLECTIONS = gql(`
  query RuviCollections($after: String, $country: CountryCode!, $language: LanguageCode!)
  @inContext(country: $country, language: $language) {
    collections(first: 24, after: $after) {
      nodes { ...RuviCollectionCard }
      pageInfo { hasNextPage endCursor }
    }
  }
`, [COLLECTION_CARD, IMAGE]);
export const COLLECTION = gql(`
  query RuviCollection($handle: String!, $after: String, $country: CountryCode!, $language: LanguageCode!)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...RuviCollectionCard
      products(first: 24, after: $after) {
        nodes { ...RuviProductCard }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`, [COLLECTION_CARD, PRODUCT_CARD, IMAGE]);
export const PRODUCT = gql(`
  query RuviProduct($handle: String!, $after: String, $country: CountryCode!, $language: LanguageCode!)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...RuviProductCard
      seo { title description }
      images(first: 30) { nodes { ...RuviImage } }
      dimensions: metafield(namespace: "custom", key: "dimensions") { type value }
      delivery: metafield(namespace: "custom", key: "delivery_information") { type value }
      variants(first: 250, after: $after) {
        nodes {
          id title availableForSale price { amount currencyCode } image { ...RuviImage }
          dimensions: metafield(namespace: "custom", key: "dimensions") { type value }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`, [PRODUCT_CARD, IMAGE]);

function unavailable(): never {
  throw new Response('The catalog is temporarily unavailable.', {status: 502});
}

export async function listCollections(request: Request, after: string | null = null) {
  const shop = storefront(request);
  if (!shop) return {mock: true, collections: demoCollections, next: null};

  const {data, errors} = await shop.client.graphql(COLLECTIONS, {variables: {after}});
  if (errors || !data) unavailable();
  const {nodes, pageInfo} = data.collections;
  return {mock: false, collections: nodes, next: pageInfo.hasNextPage ? pageInfo.endCursor : null};
}

export async function readCollection(request: Request, handle: string, after: string | null) {
  const shop = storefront(request);
  if (!shop) {
    const collection = demoCollections.find(item => item.handle === handle);
    if (!collection) throw new Response('Collection not found.', {status: 404});
    return {mock: true, collection, products: collection.products, next: null};
  }

  const {data, errors} = await shop.client.graphql(COLLECTION, {variables: {
    handle, after,
  }});
  if (errors || !data) unavailable();
  if (!data.collection) throw new Response('Collection not found.', {status: 404});
  const {products, ...collection} = data.collection;
  return {mock: false, collection, products: products.nodes, next: products.pageInfo.hasNextPage ? products.pageInfo.endCursor : null};
}

export async function readProduct(request: Request, handle: string) {
  const shop = storefront(request);
  if (!shop) {
    const product = demoProducts.find(item => item.handle === handle);
    if (!product) throw new Response('Product not found.', {status: 404});
    return {mock: true, product};
  }

  const loadPage = (after: string | null) => shop.client.graphql(PRODUCT, {variables: {
    handle, after,
  }});
  const first = await loadPage(null);
  if (first.errors || !first.data) unavailable();
  if (!first.data.product) throw new Response('Product not found.', {status: 404});
  const {variants, ...product} = first.data.product;
  const results = [...variants.nodes];
  let page = variants.pageInfo;
  while (page.hasNextPage && page.endCursor) {
    const next = await loadPage(page.endCursor);
    if (next.errors || !next.data?.product) unavailable();
    results.push(...next.data.product.variants.nodes);
    page = next.data.product.variants.pageInfo;
  }
  return {mock: false, product: {...product, variants: results}};
}
