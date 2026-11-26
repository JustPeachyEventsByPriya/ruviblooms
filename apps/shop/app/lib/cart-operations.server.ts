import {cartQueries, gql} from '@shopify/hydrogen';

export const CART_FRAGMENT = gql(`
  fragment CartFragment on Cart {
    buyerIdentity { countryCode }
    lines(first: 250) {
      nodes { merchandise { ... on ProductVariant { availableForSale } } }
    }
  }
`);

export const CART_BUYER_UPDATE = gql(`
  mutation RuviCartBuyerUpdate($cartId: ID!, $identity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $identity) {
      cart { id }
      userErrors { code message }
    }
  }
`);

export const CART_CREATE = cartQueries.cartCreate;
