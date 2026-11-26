import {useState} from 'react';
import {Form, Link, useNavigation} from 'react-router';
import type {Route} from './+types/product';
import {MockNotice} from '../components/catalog';
import {ProductGallery} from '../components/product-gallery';
import {QuantityStepper} from '../components/quantity-stepper';
import {money} from '../lib/catalog';
import {readProduct} from '../lib/catalog.server';

export const meta: Route.MetaFunction = ({data}) => data ? [
  {title: (data.product.seo.title || data.product.title) + ' | Ruvi Blooms'},
  {name: 'description', content: data.product.seo.description || data.product.description},
] : [{title: 'Arrangement | Ruvi Blooms'}];

export async function loader({request, params}: Route.LoaderArgs) {
  const data = await readProduct(request, params.handle);
  const requested = new URL(request.url).searchParams.get('variant');
  const initial = data.product.variants.find(variant =>
    variant.id === requested || (requested && /^\d+$/.test(requested) && variant.id === 'gid://shopify/ProductVariant/' + requested));
  return {...data, initialVariant: initial?.id ?? null};
}

function displayText(field: {type: string; value: string} | null | undefined) {
  if (field?.type === 'single_line_text_field' || field?.type === 'multi_line_text_field') return field.value.trim();
  return '';
}

export default function Product({loaderData}: Route.ComponentProps) {
  return <ProductDetails key={loaderData.product.handle + ':' + (loaderData.initialVariant ?? '')} data={loaderData} />;
}

function ProductDetails({data}: {data: Route.ComponentProps['loaderData']}) {
  const {mock, product} = data;
  const [selected, setSelected] = useState(() => data.initialVariant ?? product.variants.find(variant => variant.availableForSale)?.id ?? product.variants[0]?.id);
  const variant = product.variants.find(item => item.id === selected) ?? product.variants[0];
  const dimensions = displayText(variant?.dimensions) || displayText(product.dimensions);
  const delivery = displayText(product.delivery);
  const photos = [variant?.image, product.featuredImage, ...product.images.nodes]
    .filter(photo => photo != null)
    .filter((photo, index, all) => all.findIndex(item => item.url === photo.url) === index);
  const navigation = useNavigation();
  const busy = navigation.state !== 'idle';
  const adding = navigation.formAction === '/cart' && navigation.formData?.get('intent') === 'add';

  return (
    <>
      <Link viewTransition className="mb-4 inline-block text-sm underline" to="/collections">All collections</Link>
      {mock && <MockNotice />}
      <article className="grid items-start gap-5 md:grid-cols-2 md:gap-12">
        <ProductGallery key={variant?.id} photos={photos} title={product.title} />
        <div>
          <header className="mb-3 sm:mb-5">
            <h1 className="display-heading">{product.title}</h1>
            {product.description && <p className="mt-2 max-w-2xl leading-relaxed text-muted">{product.description}</p>}
          </header>
          <p className="mb-3 text-lg sm:mb-5 font-semibold text-wine" aria-live="polite">{variant && <span key={variant.id} className="variant-change inline-block">{money(variant.price)}</span>}</p>
          <Form method="post" action="/cart" viewTransition className="grid max-w-sm grid-cols-[auto_1fr] items-end gap-3">
            <input type="hidden" name="intent" value="add" />
            {product.variants.length <= 1 ? (
              <input type="hidden" name="merchandiseId" value={variant?.id ?? ''} />
            ) : product.variants.length <= 4 ? (
              <fieldset className="col-span-full grid gap-2">
                <legend className="mb-2">Arrangement option</legend>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(item => (
                    <label key={item.id}>
                      <input className="sr-only" type="radio" name="merchandiseId" value={item.id}
                        checked={item.id === variant?.id} disabled={!item.availableForSale}
                        onChange={() => setSelected(item.id)} />
                      <span className="variant-option">{item.title}{item.availableForSale ? '' : ' (Sold out)'}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <label className="col-span-full grid gap-2">
                <span>Arrangement option</span>
                <select className="catalog-input" name="merchandiseId" value={variant?.id} onChange={event => setSelected(event.target.value)}>
                  {product.variants.map(item => <option key={item.id} value={item.id}>{item.title}{item.availableForSale ? '' : ' (Sold out)'}</option>)}
                </select>
              </label>
            )}
            {variant?.availableForSale && <QuantityStepper key={variant.id} disabled={busy} />}
            <button className={variant?.availableForSale ? "gold-button min-h-11 px-3 sm:px-5" : "gold-button col-span-full"} type="submit" disabled={!variant?.availableForSale || busy}>
              {variant?.availableForSale ? (adding ? 'Adding to bag…' : 'Add to bag') : 'Sold out'}
            </button>
          </Form>
          <dl className="mt-6 grid gap-4 border-t border-line pt-4 text-sm">
            <div>
              <dt className="font-semibold text-wine">Dimensions</dt>
              <dd className="mt-1 whitespace-pre-line text-muted">{dimensions || 'Dimensions are currently unavailable.'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-wine">Delivery</dt>
              <dd className="mt-1 whitespace-pre-line text-muted">{delivery || 'Enter your delivery address at Shopify checkout to see available options and costs.'}</dd>
            </div>
          </dl>
        </div>
      </article>
    </>
  );
}
