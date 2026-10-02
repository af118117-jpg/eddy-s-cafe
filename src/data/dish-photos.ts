/*
 * Dish photos: assets-source/dishes/<menu id>.jpg, cropped to 4:5 (shown
 * square or 16:9 in places, cropped by CSS). Adding a file is enough to show
 * it: on the home page instead of the cream placeholder, and as a thumbnail
 * on the menu page. Write its alt text below; the tests check every photo has
 * one. The current files are cream placeholders (see assets-source/README.md).
 */
import type { ImageAsset, Picture } from './images'

const files = import.meta.glob<Picture>('/assets-source/dishes/*.jpg', {
  eager: true,
  import: 'default',
  query: '?aspect=4:5&photo',
})

/**
 * What each dish photo shows. The six signatures have the café's own photos
 * (see assets-source/README.md); check each line against the photo used.
 */
export const dishAlts: Readonly<Record<string, string>> = {
  'persian-style-lamb-chops': 'Persian-style lamb chops with salad and sauce',
  'chicken-spicy-moroccan-steak': 'Spicy Moroccan chicken steak with potatoes and vegetables',
  'chicken-cashew-nut': 'Chicken cashew nut with egg fried rice',
  'chicken-chilli-cheese-pizza': 'Chicken chilli cheese pizza on a wooden board',
  'eddys-katsu-club-sandwich': 'Katsu club sandwich with fries and herb mayo',
  'hunter-beef-and-egg-sando': 'Hunter beef and egg sando with fries',
}

/** Every dish photo by menu id. Without written alt text, the dish name stands in. */
export const dishPhotos: Readonly<Record<string, Picture>> = Object.fromEntries(
  Object.entries(files).map(([path, picture]) => [
    path.slice(path.lastIndexOf('/') + 1, -'.jpg'.length),
    picture,
  ]),
)

/** The dish's photo slot: its photo if there is one, otherwise a placeholder (alt = the name). */
export function dishPhoto(id: string, name: string): ImageAsset {
  const picture = dishPhotos[id]
  return picture ? { alt: dishAlts[id] ?? name, picture } : { alt: name }
}
