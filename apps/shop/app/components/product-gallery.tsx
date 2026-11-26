import {useRef, useState} from 'react';
import {CatalogPhoto} from './catalog';
import type {Photo} from '../lib/catalog';

export function ProductGallery({photos, title}: {photos: Photo[]; title: string}) {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const photo = photos[active];
  const alt = photo?.altText || title;
  const sizes = '(min-width: 90rem) 660px, (min-width: 48rem) 46vw, 94vw';

  return (
    <section aria-label="Product photos">
      {photo ? (
        <button ref={opener} className="block aspect-[16/10] max-h-58 w-full overflow-hidden bg-[#f3ebe4] md:aspect-auto md:max-h-none"
          type="button" aria-haspopup="dialog" aria-label={'Enlarge photo: ' + alt}
          onClick={() => dialog.current?.showModal()}>
          <CatalogPhoto photo={{...photo, altText: alt}} className="size-full object-contain md:h-auto" eager={active === 0} sizes={sizes} />
        </button>
      ) : (
        <div className="aspect-[16/10] max-h-58 md:aspect-[4/5] md:max-h-none"><CatalogPhoto photo={null} sizes={sizes} /></div>
      )}
      {photos.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Choose a product photo">
          {photos.map((item, index) => (
            <li key={item.url}>
              <button type="button" aria-label={'View photo ' + (index + 1) + ': ' + (item.altText || title)}
                aria-pressed={active === index} onClick={() => setActive(index)}
                className="block size-14 border border-line bg-[#f3ebe4] p-0.5 aria-pressed:border-wine">
                <CatalogPhoto photo={{...item, altText: ''}} className="size-full object-contain" sizes="56px" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <dialog ref={dialog} aria-labelledby="gallery-dialog-title" onClose={() => opener.current?.focus()}
        className="m-auto max-h-[95dvh] w-[min(94vw,64rem)] max-w-none overflow-auto bg-ivory p-3 text-ink backdrop:bg-plum/75">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 id="gallery-dialog-title" className="font-display text-2xl">{title}</h2>
          <form method="dialog"><button className="min-h-11 px-3 text-sm font-semibold underline" type="submit">Close photo</button></form>
        </div>
        {photo && <CatalogPhoto photo={{...photo, altText: alt}} className="max-h-[78dvh] w-full object-contain" sizes="(min-width: 70rem) 1000px, 94vw" />}
      </dialog>
    </section>
  );
}
