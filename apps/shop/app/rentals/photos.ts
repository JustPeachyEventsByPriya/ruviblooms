export type RentalPhoto = {src: string; srcSet: string};

const variants = import.meta.glob<string>('./assets/*.webp', {eager: true, import: 'default'});
const byName = new Map<string, {url: string; width: number}[]>();

for (const [file, url] of Object.entries(variants)) {
  const match = /^\.\/assets\/(.+)-(\d+)\.webp$/.exec(file);
  if (!match) continue;
  const [, name, width] = match;
  const photos = byName.get(name) ?? [];
  photos.push({url, width: Number(width)});
  byName.set(name, photos);
}

export function rentalPhoto(name: string): RentalPhoto {
  const photos = byName.get(name)?.sort((a, b) => a.width - b.width);
  const largest = photos?.at(-1);
  if (!photos || !largest) throw new Error('Missing rental photo: ' + name);
  return {src: largest.url, srcSet: photos.map(({url, width}) => url + ' ' + width + 'w').join(', ')};
}
