# Ruvi Blooms

Ruvi Blooms is a server-rendered storefront using Shopify Hydrogen 2026.10, React Router, TypeScript, and Tailwind CSS. The local preview includes four mock collections, six arrangements, and a browser-persisted bag with sample prices.

## Local setup

Use Node.js 22.12 or later. Run these commands from the Ruvi Blooms project directory.

```sh
npm ci
npm run dev
```

Open the localhost URL printed in the terminal, normally `http://localhost:5173`. Use Ctrl+C to stop it. To stay in mock mode, leave at least one Shopify variable unset. Mock checkout is unavailable.

## Check and run the production build locally

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm start` serves the built app on loopback, normally `http://127.0.0.1:3000`. If needed, set `PORT` to a free port before starting it. The archived standalone design is available in `homepage-preview.html`.

## Connect a Shopify development store

Copy `.env.example` to `.env` in the project root. Enter both Shopify values and restart the server. The development and production start commands read `.env`. The test suite uses a local fixture. Variables already set in the shell take precedence.

| Variable | Value |
| --- | --- |
| `PUBLIC_STORE_DOMAIN` | Your Shopify store domain, such as `your-store.myshopify.com` |
| `PUBLIC_STOREFRONT_API_TOKEN` | Public Storefront API access token from the Shopify Headless sales channel |
| `PORT` | Optional port for `npm start` |

Publish the products and collections to that sales channel. Give the public Storefront token product-listing and cart read/write access. Keep `.env` out of source control. The application uses only the public Storefront token from the server; it has no Admin API integration.

With both values configured, catalog and cart requests use Shopify. A Shopify error displays an error state so it can be distinguished from an intentionally enabled mock preview. At checkout, the live bag hands the buyer to the current HTTPS checkout URL returned by Shopify. The app never collects payment details.

The catalog uses Shopify Storefront API **2026-10**, English, and the Canadian market. New carts are created with a Canadian buyer country and existing carts are repriced when their country differs. Every displayed currency and price comes from Shopify. The development store currently returns CAD for Canada. Confirm currency and product availability in Shopify Markets before launch. Shopify can return a different presentment currency based on store configuration. Checkout calculates delivery, taxes and duties using the customer's information and store settings.

### Product details in Shopify

- Add product photos in the order you want them shown and write a short alt description for each. The gallery shows up to 30 product images and begins with the selected variant image when it exists.
- Define optional Storefront-readable text metafields `custom.dimensions` on products and variants and `custom.delivery_information` on products. Use single-line or multi-line text. Variant dimensions take priority over product dimensions. Missing dimensions get a plain unavailable message, and delivery costs are deferred to checkout.
- Use `?variant=<numeric Shopify variant ID>` on the product URL to open a specific option.

## Local smoke test

1. Open the homepage and browse all four mock collections. Open a product from a collection, choose a variant, and add it to the bag.
2. Reload the bag, check the variant and price, update the quantity, and remove the item. The mock bag uses its own browser cookie.
3. Repeat at a mobile and tablet width. Check Tab, Shift+Tab, Enter, and Escape in the navigation. Turn on reduced motion and check that page and selection animations stop.
4. Repeat the flow after running `npm start` and confirm that an unknown product or collection returns a 404.

Before launch, verify published products, inventory, cart prices, and actual Shopify checkout using a development store. Check the store's Shopify Markets, shipping settings, and final product photography.

## Preview imagery

The built-in ImageGen tool created seven unbranded concept photographs. The responsive JPEGs are in `public/editorial/`. The approved logo files in `public/brand/` are original artwork.

- Hero. Low plum ceramic vessel with dusty blush garden roses, ivory ranunculus and burgundy dahlias on travertine, with muted rose plaster and directional afternoon light.
- Romantic Blush. Rounded blush garden roses and mauve ranunculus in an antique brass bowl, with ivory limestone and pale rosy plaster.
- Ivory Reverie. Compact rectangular ivory ceramic vessel with cream flowers and sage accents, with a linen-covered console and soft daylight.
- Rosewater Muse. Asymmetrical tea roses and wine dahlias in an aubergine bowl, with beige travertine and a muted mauve backdrop.
- Burgundy Nocturne. Oxblood dahlias and dark plum ranunculus in an aged bronze urn with deep burgundy plaster and directional light.
- Champagne Reverie. Champagne roses and apricot ranunculus in a rectangular stone bowl with a warm cream backdrop.
- Alba Magnolia. Airy magnolia branches in a tapered off-white urn with ivory limewash and natural daylight.

The same collection imagery is reused for the corresponding Signature Edit card.
