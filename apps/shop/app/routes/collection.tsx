import {Link} from 'react-router';
import type {Route} from './+types/collection';
import {CatalogHeading, MockNotice, MoreResults, ProductTile} from '../components/catalog';
import {readCollection} from '../lib/catalog.server';

export const meta: Route.MetaFunction = ({data}) => data ? [
  {title: data.collection.title + ' | Ruvi Blooms'},
  {name: 'description', content: data.collection.description},
] : [{title: 'Collection | Ruvi Blooms'}];

export const loader = ({request, params}: Route.LoaderArgs) =>
  readCollection(request, params.handle, new URL(request.url).searchParams.get('after'));

export default function Collection({loaderData}: Route.ComponentProps) {
  const {mock, collection, products, next} = loaderData;
  return (
    <>
      <Link viewTransition className="mb-5 inline-block text-sm underline" to="/collections">All collections</Link>
      <CatalogHeading title={collection.title} description={collection.description} />
      {mock && <MockNotice />}
      {products.length === 0 && <p className="text-muted">No arrangements are available in this collection yet.</p>}
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 md:gap-x-6">
        {products.map(product => <ProductTile key={product.handle} product={product} />)}
      </div>
      <MoreResults cursor={next} />
    </>
  );
}
