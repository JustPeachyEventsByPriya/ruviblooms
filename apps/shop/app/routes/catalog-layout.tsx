import {Link, Outlet, isRouteErrorResponse, useLocation, useNavigation} from 'react-router';
import type {Route} from './+types/catalog-layout';

export default function CatalogLayout() {
  const navigation = useNavigation();
  const {pathname} = useLocation();
  const loading = navigation.state === 'loading' && !navigation.formMethod && navigation.location.pathname !== pathname;

  return (
    <main id="main-content" tabIndex={-1} className="shell section-space" aria-busy={loading}>
      {loading ? (
        <>
          <p role="status" className="sr-only">Loading storefront</p>
          <div aria-hidden="true" className="motion-safe:animate-pulse">
            <div className="mb-7 h-10 w-56 max-w-full bg-line/60" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="aspect-[16/10] bg-line/40" />
              <div className="aspect-[16/10] bg-line/40" />
            </div>
          </div>
        </>
      ) : <Outlet />}
    </main>
  );
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main id="main-content" tabIndex={-1} className="shell section-space">
      <h1 className="display-heading">{missing ? 'Page not found' : 'Temporarily unavailable'}</h1>
      <Link viewTransition className="gold-button mt-6" to={missing ? '/collections' : '/'}>{missing ? 'Explore collections' : 'Return to Ruvi Blooms'}</Link>
    </main>
  );
}
