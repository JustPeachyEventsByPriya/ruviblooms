import {Link} from 'react-router';
import {EditorialPhoto} from '../components/storefront';
import {floralConcepts} from '../lib/floral-concepts';
import type {Route} from './+types/collections';
import {CatalogHeading, CollectionTile, FeaturedCollection, MockNotice, MoreResults} from '../components/catalog';
import {listCollections} from '../lib/catalog.server';

export const meta: Route.MetaFunction = () => [
  {title: 'Collections | Ruvi Blooms'},
  {name: 'description', content: 'Explore Ruvi Blooms floral arrangement collections.'},
];

export const loader = ({request}: Route.LoaderArgs) => listCollections(request, new URL(request.url).searchParams.get('after'));

export default function Collections({loaderData}: Route.ComponentProps) {
  const {mock, collections, next} = loaderData;
  return (
    <>
      <CatalogHeading title="The collections" />
      {import.meta.env.DEV && (
        <a className="mb-6 inline-block text-sm font-semibold text-wine underline underline-offset-4" href="#sample-collections">See sample collections</a>
      )}
      {mock && <MockNotice />}
      {collections.length === 0 && <p className="text-muted">No collections are available yet.</p>}
      {collections.length === 1 ? <FeaturedCollection collection={collections[0]} /> : (
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
          {collections.map(collection => <CollectionTile key={collection.handle} collection={collection} />)}
        </div>
      )}
      <MoreResults cursor={next} />
      {import.meta.env.DEV && (
        <section id="sample-collections" tabIndex={-1} aria-labelledby="sample-title" className="mt-12 border-t border-line pt-8 sm:mt-16">
          <h2 id="sample-title" className="display-heading">Sample collections</h2>
          <p className="mt-3 text-muted">Four floral palettes shown as concept imagery.</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4">
            {floralConcepts.map(concept => (
              <li key={concept.handle}>
                <Link viewTransition to={'/concepts/' + concept.handle} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-blush motion-safe:[&_img]:transition-transform motion-safe:[&_img]:duration-500 motion-safe:group-hover:[&_img]:scale-105">
                    <EditorialPhoto image={{name: concept.handle, alt: concept.alt}}
                      sizes="(min-width: 90rem) 310px, (min-width: 64rem) 23vw, 46vw" />
                  </div>
                  <h3 className="border-b border-line py-3 font-display text-2xl leading-tight font-semibold group-hover:text-wine md:text-3xl">{concept.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
