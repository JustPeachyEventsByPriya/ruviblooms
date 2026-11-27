# Ruvi Blooms

Ruvi Blooms is a single Shopify Hydrogen and React Router app in `apps/shop`. Shop uses Shopify-hosted checkout. The rental catalog at `/rentals` shares the site navigation and footer, with a separate browser-session cart and Web3Forms inquiry.

## Local development

From `apps/shop`, run `npm ci` and `npm run dev`. Use the environment template there. Without Shopify credentials the app uses its labeled mock catalog. The rentals route requires a Web3Forms key to send email.

## Cloudflare Workers

| Connected build setting | Value |
| --- | --- |
| Root directory | `apps/shop` |
| Build command | `npm ci && npm run build:cloudflare` |
| Deploy command | `npx wrangler deploy` |

The Worker name in `apps/shop/wrangler.jsonc` must match the connected Worker. The Cloudflare build outputs a single SSR app in `.cloudflare-build`. Run `npx wrangler dev --local` after building to verify it locally.

Set `PUBLIC_STORE_DOMAIN` and `PUBLIC_STOREFRONT_API_TOKEN` as Worker runtime values for the live catalog. Set `VITE_WEB3FORMS_ACCESS_KEY` as a build variable using the public form key issued for `ruviblooms@gmail.com`. Optional `VITE_WHATSAPP_URL` and `VITE_INSTAGRAM_URL` are also build variables. Keep credentials out of Git.

The intended custom domain is `ruviblooms.com`. Connect it after testing the Worker on its preview address. Just Peachy Events is a separate project.
