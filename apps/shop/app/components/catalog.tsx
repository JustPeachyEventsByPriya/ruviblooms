import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {money, type CollectionCardData, type Photo, type ProductCardData} from '../lib/catalog';

export function CatalogHeading({title, description}: {title: string; description?: string}) {
  return (
    <header className="mb-8">
      <h1 className="display-heading">{title}</h1>
      {description && <p className="mt-4 max-w-2xl leading-relaxed text-muted">{description}</p>}
    </header>
  );
}

export function MockNotice({children = 'Mock catalog with concept imagery and sample prices.'}: {children?: ReactNode}) {
  return <p className="mb-6 w-fit border border-line bg-[#f3e5e4] px-4 py-2 text-sm text-ink">{children}</p>;
}

export function CatalogPhoto({photo, sizes, eager = false, className = 'size-full object-cover'}: {photo: Photo | null; sizes: string; eager?: boolean; className?: string}) {
  if (!photo) return <div className="grid size-full place-items-center bg-[#f3e5e4] text-sm text-muted">Image coming soon</div>;
  const local = photo.url.startsWith('/editorial/');
  const source = (width: number) => {
    if (local) return photo.url.replace('-800.jpg', '-' + width + '.jpg');
    const url = new URL(photo.url);
    url.searchParams.set('width', String(width));
    return url.href;
  };
  return <img className={className} src={photo.url} alt={photo.altText ?? ''}
    width={photo.width ?? undefined} height={photo.height ?? undefined}
    srcSet={[480, 800, 1200].map(width => source(width) + ' ' + width + 'w').join(', ')}
    sizes={sizes} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" />;
}

export function CollectionTile({collection, heading: Heading = 'h2', compact = false}: {collection: CollectionCardData; heading?: 'h2' | 'h3'; compact?: boolean}) {
  return (
    <Link viewTransition to={'/collections/' + collection.handle} className="group block">
      <div className="aspect-[5/4] overflow-hidden bg-[#f3ebe4]">
        <CatalogPhoto className="size-full object-contain" photo={collection.image} sizes={compact ? "(min-width: 64rem) 23vw, 46vw" : "(min-width: 90rem) 660px, (min-width: 40rem) 46vw, 94vw"} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-4">
        <Heading className={compact ? "font-display text-xl leading-tight font-semibold sm:text-3xl" : "font-display text-3xl font-semibold sm:text-4xl"}>{collection.title}</Heading>
        <span className={compact ? "nav-link hidden underline-offset-4 group-hover:underline sm:inline" : "nav-link underline-offset-4 group-hover:underline"} aria-hidden="true">View collection</span>
      </div>
    </Link>
  );
}

export function FeaturedCollection({collection, heading: Heading = 'h2'}: {
  collection: CollectionCardData;
  heading?: 'h2' | 'h3';
}) {
  return (
    <Link viewTransition to={'/collections/' + collection.handle}
      className="group grid overflow-hidden bg-plum text-ivory md:grid-cols-[1.2fr_1fr]">
      <div className="aspect-[16/10] overflow-hidden bg-[#f3ebe4]">
        <CatalogPhoto className="size-full object-contain" photo={collection.image} sizes="(min-width: 90rem) 700px, (min-width: 48rem) 52vw, 94vw" />
      </div>
      <div className="flex flex-col items-start justify-center px-[clamp(1.25rem,4vw,4rem)] py-7 lg:py-12">
        <Heading className="display-heading text-gold">{collection.title}</Heading>
        {collection.description && <p className="mt-4 max-w-sm text-ivory/90">{collection.description}</p>}
        <span className="mt-5 border-b border-gold pb-1 text-sm font-semibold text-gold group-hover:text-ivory">
          Shop the collection
        </span>
      </div>
    </Link>
  );
}

export function ProductTile({product, heading: Heading = 'h2', showPrice = true}: {product: ProductCardData; heading?: 'h2' | 'h3'; showPrice?: boolean}) {
  const {minVariantPrice, maxVariantPrice} = product.priceRange;
  return (
    <Link viewTransition to={'/products/' + product.handle} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-[#f3ebe4]">
        <CatalogPhoto className="size-full object-contain" photo={product.featuredImage} sizes="(min-width: 90rem) 430px, (min-width: 48rem) 30vw, 46vw" />
      </div>
      <Heading className="mt-3 font-display text-2xl font-semibold leading-none group-hover:text-wine sm:text-4xl">{product.title}</Heading>
      {showPrice && <p className="mt-2 text-sm text-wine">{minVariantPrice.amount !== maxVariantPrice.amount ? 'From ' : ''}{money(minVariantPrice)}</p>}
    </Link>
  );
}

export function MoreResults({cursor}: {cursor: string | null}) {
  if (!cursor) return null;
  return <Link viewTransition className="gold-button mt-8" to={'?after=' + encodeURIComponent(cursor)}>Next page</Link>;
}
