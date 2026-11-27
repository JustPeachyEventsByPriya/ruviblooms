import {index, layout, route, type RouteConfig} from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('rentals', 'routes/rentals.tsx'),
  layout('routes/catalog-layout.tsx', [
    route('collections', 'routes/collections.tsx'),
    route('collections/:handle', 'routes/collection.tsx'),
    route('products/:handle', 'routes/product.tsx'),
    route('concepts/:handle', 'routes/floral-concept.tsx'),
    route('cart', 'routes/cart.tsx'),
  ]),
] satisfies RouteConfig;
