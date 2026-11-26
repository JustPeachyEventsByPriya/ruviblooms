import {createShopifyRequestContext, createStorefrontClient, defineShopifyI18n} from '@shopify/hydrogen';

export const buyerCountry = 'CA';
const i18n = defineShopifyI18n({defaultLocale: {language: 'EN', country: buyerCountry}});

export function storefront(request: Request) {
  const storeDomain = process.env.PUBLIC_STORE_DOMAIN?.trim();
  const publicStorefrontToken = process.env.PUBLIC_STOREFRONT_API_TOKEN?.trim();
  if (!storeDomain || !publicStorefrontToken) return null;

  const requestContext = createShopifyRequestContext({request, i18n});
  const client = createStorefrontClient({type: 'public', requestContext, config: {
    storeDomain,
    publicStorefrontToken,
  }});
  return {client, requestContext};
}
