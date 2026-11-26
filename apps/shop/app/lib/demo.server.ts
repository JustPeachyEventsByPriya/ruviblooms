import type {CollectionCardData, Photo, ProductCardData, Variant} from './catalog';

function photo(name: string, altText: string): Photo {
  return {url: '/editorial/' + name + '-800.jpg', altText, width: 800, height: 1000};
}

function product(
  handle: string,
  title: string,
  description: string,
  image: Photo,
  options: {id: string; amount: string; title?: string}[],
) {
  const variants = options.map(option => ({
    id: 'demo-' + option.id,
    title: option.title ?? 'Standard arrangement',
    availableForSale: true,
    dimensions: null,
    price: {amount: option.amount, currencyCode: 'CAD'},
    image,
  }));
  const byPrice = [...variants].sort((a, b) => Number(a.price.amount) - Number(b.price.amount));

  return {
    handle, title, description, featuredImage: image, images: {nodes: [image]}, dimensions: null, delivery: null, seo: {title: null, description: null},
    priceRange: {minVariantPrice: byPrice[0].price, maxVariantPrice: byPrice[byPrice.length - 1].price},
    variants,
  } satisfies ProductCardData & {images: {nodes: Photo[]}; dimensions: null; delivery: null; seo: {title: null; description: null}; variants: (Variant & {dimensions: null})[]};
}

const romanticBlush = product('romantic-blush', 'Romantic Blush', 'Blush garden roses in a softly rounded composition.',
  photo('romantic-blush', 'Blush garden roses in a low brass bowl'), [{id: 'blush', amount: '125.00'}]);
const ivoryReverie = product('ivory-reverie', 'Ivory Reverie', 'Ivory blooms with sage accents for intimate spaces.',
  photo('ivory-reverie', 'Cream roses in a rectangular ceramic vessel'), [{id: 'ivory', amount: '95.00'}]);
const rosewaterMuse = product('rosewater-muse', 'Rosewater Muse', 'Dusty rose and wine tones in a loose, sculptural silhouette.',
  photo('rosewater-muse', 'Dusty rose and burgundy flowers in an aubergine bowl'), [{id: 'rosewater', amount: '145.00'}]);
const nocturne = product('burgundy-nocturne', 'Burgundy Nocturne', 'Oxblood dahlias and plum ranunculus in an aged bronze urn.',
  photo('nocturne', 'Oxblood dahlias and dark plum ranunculus in a bronze urn'), [
    {id: 'nocturne-classic', title: 'Classic', amount: '165.00'},
    {id: 'nocturne-grand', title: 'Grand', amount: '225.00'},
  ]);
const champagne = product('champagne-reverie', 'Champagne Reverie', 'An elongated arrangement of pale apricot and champagne blooms for a gathering table.',
  photo('champagne', 'Champagne roses and apricot ranunculus in a rectangular stone bowl'), [{id: 'champagne', amount: '155.00'}]);
const alba = product('alba-magnolia', 'Alba Magnolia', 'Airy ivory magnolia branches set in a tapered ceramic urn.',
  photo('alba', 'Ivory magnolia branches in a tapered off-white urn'), [
    {id: 'alba-classic', title: 'Classic', amount: '140.00'},
    {id: 'alba-tall', title: 'Tall', amount: '185.00'},
  ]);

export const demoProducts = [romanticBlush, ivoryReverie, rosewaterMuse, nocturne, champagne, alba];

export const demoCollections = [
  {handle: 'round-arrangements', title: 'Round Arrangements', description: 'Softly rounded centerpieces with sculptural silhouettes.', image: romanticBlush.featuredImage, products: [romanticBlush, rosewaterMuse]},
  {handle: 'petite-rectangular', title: 'Petite Rectangular', description: 'Low arrangements for a console, mantel, or intimate table.', image: ivoryReverie.featuredImage, products: [ivoryReverie]},
  {handle: 'statement-centerpieces', title: 'Statement Centerpieces', description: 'Generous compositions for dining tables and special occasions.', image: nocturne.featuredImage, products: [nocturne, champagne]},
  {handle: 'sculptural-stems', title: 'Sculptural Stems', description: 'Airy branches and expressive silhouettes for a console or entryway.', image: alba.featuredImage, products: [alba]},
] satisfies (CollectionCardData & {products: ProductCardData[]})[];
