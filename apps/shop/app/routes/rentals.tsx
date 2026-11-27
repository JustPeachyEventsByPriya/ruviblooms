import type {Route} from './+types/rentals';
import {RentalsApp} from '../rentals/RentalsApp';
import {submitRentalInquiry} from '../rentals/inquiry';

export function meta(_: Route.MetaArgs) {
  return [
    {title: 'Event Rentals | Ruvi Blooms'},
    {name: 'description', content: 'Explore Ruvi Blooms event rentals, from loveseats and reusable florals to tabletop details.'},
  ];
}

export default function Rentals() {
  return (
    <main id="main-content" tabIndex={-1}>
      <RentalsApp
        onInquiry={submitRentalInquiry}
        whatsappUrl={import.meta.env.VITE_WHATSAPP_URL?.trim()}
        instagramUrl={import.meta.env.VITE_INSTAGRAM_URL?.trim()}
      />
    </main>
  );
}
