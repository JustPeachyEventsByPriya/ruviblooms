export type Money = {amount: string; currencyCode: string};
export type Photo = {url: string; altText: string | null; width: number | null; height: number | null};
export type ProductCardData = {
  handle: string;
  title: string;
  description: string;
  featuredImage: Photo | null;
  priceRange: {minVariantPrice: Money; maxVariantPrice: Money};
};
export type Variant = {id: string; title: string; availableForSale: boolean; price: Money; image: Photo | null};
export type CollectionCardData = {handle: string; title: string; description: string; image: Photo | null};

export function money(value: Money) {
  return new Intl.NumberFormat('en', {style: 'currency', currency: value.currencyCode}).format(Number(value.amount));
}
