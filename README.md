# Ruvi Blooms

This repository contains only Ruvi Blooms. Just Peachy Events is a separate project.

| App | Directory | Development | Production build |
| --- | --- | --- | --- |
| Shop (Shopify Hydrogen) | apps/shop | npm ci, then npm run dev | npm run build |
| Rentals (React and Vite) | apps/rentals | npm ci, then npm run dev | npm run build |

Use Node 22.12 or newer. Run the commands from the selected app directory. Both apps have their own lockfile and environment example.

## Domain plan

Use ruviblooms.com as the canonical brand domain. When a host is selected, the intended layout is Shop at / and Rentals at /rentals, with navigation between the two. Shared-domain routing requires host configuration and verification. This initial import includes independent apps and no deployment workflow.

The Hydrogen storefront needs a host that runs its server and can connect to Shopify. Rental inquiries stay separate from Shopify checkout. The Rentals app can use Web3Forms for live inquiries and local capture for development.

Set DNS at Spaceship only after the selected host provides the required records. Preserve existing email-related DNS records.
