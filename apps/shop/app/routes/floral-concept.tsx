import {Link} from 'react-router';
import type {Route} from './+types/floral-concept';
import {EditorialPhoto} from '../components/storefront';
import {floralConcepts} from '../lib/floral-concepts';

export function loader({params}: Route.LoaderArgs) {
  const concept = import.meta.env.DEV && floralConcepts.find(item => item.handle === params.handle);
  if (!concept) throw new Response('Sample collection not found.', {status: 404});
  return {concept};
}

export const meta: Route.MetaFunction = ({data}) => [
  {title: data ? data.concept.title + ' | Ruvi Blooms Samples' : 'Sample Collection | Ruvi Blooms'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export default function FloralConcept({loaderData}: Route.ComponentProps) {
  const {concept} = loaderData;
  return (
    <>
      <Link viewTransition to="/collections#sample-collections" className="mb-5 inline-block text-sm underline">All sample collections</Link>
      <article className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
        <div className="overflow-hidden bg-blush">
          <EditorialPhoto image={{name: concept.handle, alt: concept.alt}} sizes="(min-width: 90rem) 620px, (min-width: 48rem) 46vw, 94vw" eager />
        </div>
        <div>
          <p className="eyebrow mb-3 text-wine">Sample collection</p>
          <h1 className="display-heading">{concept.title}</h1>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">{concept.description}</p>
        </div>
      </article>
    </>
  );
}
