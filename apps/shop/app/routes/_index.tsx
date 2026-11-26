import {Link} from 'react-router';
import type {Route} from './+types/_index';
import {EditorialPhoto, SectionHeading} from '../components/storefront';
import {CollectionTile, FeaturedCollection, MockNotice, ProductTile} from '../components/catalog';
import {listCollections} from '../lib/catalog.server';
import {demoProducts} from '../lib/demo.server';

export async function loader({request}: Route.LoaderArgs) {
  const {mock, collections} = await listCollections(request);
  return {mock, collections: collections.slice(0, mock ? 4 : 2), products: mock ? demoProducts.slice(0, 3) : []};
}

export function meta(_: Route.MetaArgs) {
  const title = 'Ruvi Blooms | Timeless Floral Art';
  const description = 'Explore the debut Ruvi Blooms collection of considered floral arrangements for timeless interiors, coming soon to the U.S. and Canada.';

  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
  ];
}

export default function Homepage({loaderData}: Route.ComponentProps) {
  const {mock, collections, products} = loaderData;
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="grid bg-plum text-ivory md:grid-cols-2" aria-labelledby="hero-title">
        <div className="flex items-center bg-[radial-gradient(ellipse_at_top_left,#4b1b37,transparent_75%)] px-[clamp(1.25rem,5vw,6rem)] py-10 md:py-12">
          <div className="mx-auto w-full max-w-3xl">
            <p className="eyebrow flex items-center gap-3 text-gold before:h-px before:w-6 before:bg-current">
              The debut collection
            </p>
            <h1 id="hero-title" className="mt-3 font-display text-[clamp(3.4rem,7.9vw,9rem)] leading-[0.9] tracking-[-0.045em] text-gold">
              Ruvi Blooms
            </h1>
            <p className="mt-4 max-w-xl font-display text-[clamp(1.75rem,3.2vw,3.5rem)] leading-[1.02] text-blush">
              <em>A softer way to make a statement.</em>
            </p>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-ivory/90">
              Timeless floral arrangements, composed with intention for the spaces you love.
            </p>
            <a className="gold-button mt-6" href="#collections">Explore the collections</a>
          </div>
        </div>
        <figure className="relative aspect-[4/3] w-full min-w-0 overflow-hidden bg-wine md:aspect-[7/8] md:max-h-[38rem] md:border-l md:border-gold/25">
          <EditorialPhoto eager sizes="(min-width: 48rem) 50vw, 100vw" image={{
            name: 'floral-hero', alt: 'Blush and burgundy flowers in a sculptural plum bowl',
          }} />
          <figcaption className="absolute right-3 bottom-3 bg-plum px-3 py-1.5 text-xs text-ivory sm:right-5 sm:bottom-5">
            Concept imagery
          </figcaption>
        </figure>
      </section>

      <section className="shell section-space" id="collections" tabIndex={-1}>
        <SectionHeading eyebrow="The collections" description="Floral silhouettes for the quiet corners and grand moments that make a home your own.">
          Discover your <em>forever flowers.</em>
        </SectionHeading>
        {mock && <MockNotice>Mock collections with concept imagery.</MockNotice>}
        {collections.length === 1 ? <FeaturedCollection collection={collections[0]} heading="h3" /> : (
          <div className={mock ? "grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4" : "grid gap-x-6 gap-y-6 sm:grid-cols-2"}>
            {collections.map(collection => <CollectionTile key={collection.handle} collection={collection} heading="h3" compact={mock} />)}
          </div>
        )}
        <Link viewTransition to="/collections" className="gold-button mt-7">Browse all collections</Link>
      </section>

      <section className="bg-[#f3e5e4]" id="signature-edit" tabIndex={-1}>
        <div className="shell section-space">
          <SectionHeading eyebrow="The Signature Edit"
            description={mock ? 'Preview collection with illustrative names and concept photography.' : 'Discover floral arrangements for the spaces you love.'}>
            Considered details.<br /><em>Lasting impressions.</em>
          </SectionHeading>
          {mock ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 md:gap-x-6">
              {products.map(product => <li key={product.handle}><ProductTile product={product} heading="h3" showPrice={false} /></li>)}
            </ul>
          ) : <Link className="gold-button" to="/collections">Browse arrangements</Link>}
        </div>
      </section>

      <section className="shell section-space text-center" id="story" tabIndex={-1}>
        <p className="eyebrow text-wine">The Ruvi philosophy</p>
        <h2 className="display-heading mt-4">Some beauty is <em>made to last.</em></h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
          We believe the most beautiful spaces feel personal. Our floral pieces bring romance,
          softness, and a sense of occasion to the everyday.
        </p>
      </section>
    </main>
  );
}
