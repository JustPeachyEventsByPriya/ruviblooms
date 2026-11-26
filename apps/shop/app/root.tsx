import {useEffect, useRef, type ReactNode} from 'react';
import {isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation} from 'react-router';
import type {Route} from './+types/root';
import '@fontsource-variable/dm-sans/wght.css';
import '@fontsource-variable/cormorant-garamond/wght.css';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import './styles.css';
import {Footer, Header} from './components/storefront';

export function Layout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#321125" />
        <link rel="icon" type="image/png" href="/brand/04_YouTube_Square_Icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const {pathname, hash} = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const changedPage = previousPath.current !== pathname;
    previousPath.current = pathname;
    const target = hash
      ? document.getElementById(hash.slice(1))
      : changedPage ? document.getElementById('main-content') : null;
    target?.focus({preventScroll: true});
  }, [pathname, hash]);
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="shell py-24">
      <h1 className="font-display text-5xl">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <a className="mt-6 inline-block underline" href="/">Return to Ruvi Blooms</a>
    </main>
  );
}
