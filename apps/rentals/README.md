# Ruvi Blooms Rentals

A React and TypeScript rental catalog for event seating, reusable florals, and tabletop décor. The standalone preview uses photos from the Just Peachy rental folder. The pictured event styling may include pieces from multiple rentals. Confirm availability and inclusions separately. The rental cart holds quantities and displays sample prices in Canadian dollars. The inquiry form submits directly to the local rental server.

## Standalone

```sh
npm ci
npm run dev
npm run typecheck
npm run build
```

Copy .env.example to .env.local and set VITE_WHATSAPP_URL and VITE_INSTAGRAM_URL to the business’s HTTPS WhatsApp and Instagram links. Each floating icon appears when its link is configured. Restart Vite after changing the file. For an embedded app, pass whatsappUrl and instagramUrl to RentalsApp.

Serve the generated `dist/` directory on the chosen rental domain. Vite builds relative asset paths so the same bundle can also be served from a subdirectory.

## Send inquiries with Web3Forms

Create a Web3Forms access key for ruviblooms@gmail.com and add it as VITE_WEB3FORMS_ACCESS_KEY in .env.local. Restart Vite. With the key set, the browser sends inquiries directly to Web3Forms, including contact details, selected rentals, quantities and sample prices. The key determines the receiving inbox. Leave the key blank to use local capture or SMTP.

## Test inquiry email locally

Start the app with npm run dev, add rentals and submit the inquiry form. The default capture mode writes a complete email to the ignored .rental-inquiries/ directory for inspection. Use test contact details. The local Vite preview server also supports this route.

For actual delivery, copy .env.example to .env.local if needed. Set RENTAL_MAIL_MODE=smtp and use your SMTP provider’s host, port, username and SMTP password. Optionally set RENTAL_MAIL_FROM to an address your provider authorizes for that login. Restart the local server. The recipient is fixed at ruviblooms@gmail.com, and the customer’s email is used as Reply-To. Keep these credentials server-side and out of source control.

The built files are static. The local route is available through Vite dev and preview only. An embedded host can supply its own onInquiry callback.

## Mount inside Just Peachy

Install this folder from the Just Peachy project with `npm install ../ruvi-blooms-rentals` (adjust the path to this folder). In your React host, import the component and mount it in your existing page routing:

```tsx
import {RentalsApp} from 'ruvi-blooms-rentals/react';

// The host supplies its own route, e.g. /rentals.
export function RentalsPage() {
  return <RentalsApp />;
}
```

The component owns its own catalog state and scoped styling. It does not start a router or assume the app is at the root URL. Keep React and React DOM deduplicated in the host Vite configuration when linking the app locally.

Pass rentals to supply your own inventory and onInquiry to connect a host-provided inquiry endpoint. The callback receives contact details, selected rentals, quantities, sample prices, the event date and venue. Return a rejected promise on submission failure.


## Active rental photos

The storefront uses resized copies from the rental folder. These files are bundled with the application, so the preview and any future host can serve them without access to the source drive.

| Asset | Source |
| --- | --- |
| Homepage cream lounge setup | IMG_0787.HEIC |
| White Curved Loveseat | 8BC761D9-324B-49E0-876E-81903F545E08.jpg |
| White Floral Arch | IMG_1522.JPG |
| Blue & White Floral Frame | IMG_0672.JPG |
| Blush Arch Backdrop | BBAF3187-72E5-46C8-A9D5-A38B032DFD06.jpg |
| Peacock Ceremony Décor | IMG_5305.JPG |

| Added photo or rental | HEIC source |
| --- | --- |
| Blush Arch Backdrop, alternate view | IMG_0146 |
| Blue & White Floral Frame, alternate views | IMG_1025, IMG_1032 |
| Ruby & Blush Floral Arch | IMG_0014, IMG_0003 |
| Pearl Shell Chair | IMG_0059 |
| White Floral Pillars | IMG_0173, IMG_0181 |
| Blush & White Table Florals | IMG_0085 |
| Cream Lounge Set | IMG_0787, IMG_0788 |
| White Floral Centrepiece | IMG_5680 |
| Blue & White Table Florals | IMG_9031, IMG_9030 |
| Woven Hanging Lanterns | IMG_3745 |
| Lavender Butterfly Backdrop | IMG_4834, IMG_4845 |
| Gold Ceremony Canopy | IMG_7331, IMG_7334 |
| Charcoal Channel-Tufted Loveseat | IMG_7950, IMG_7955 |
| Blush Channel-Tufted Loveseat | IMG_8100(1), IMG_8100 |

The selected HEIC photos are exported as JPEG copies. The rental card's **View photos** button opens the gallery when alternate views are available.
