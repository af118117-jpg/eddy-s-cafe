/*
 * Home page content: copy and photo slots. Which dishes appear is set in
 * home-selection.ts; names, descriptions and prices come from the menu data.
 * Search for "TODO(copy)" and "TODO(photo)" for placeholders to replace.
 */
import drinksPhoto from '/assets-source/drinks.jpg?aspect=4:5&photo'
import feastsPhoto from '/assets-source/feasts.jpg?aspect=4:5&photo'
import heroNarrow from '/assets-source/hero.jpg?aspect=4:5&avifQuality=25&photo'
import heroWide from '/assets-source/hero.jpg?aspect=16:9&avifQuality=25&photo'
import introPhoto from '/assets-source/intro.jpg?aspect=4:5&photo'
import mapPhoto from '/assets-source/map.jpg?aspect=1:1&photo'
import spacePhoto from '/assets-source/space.jpg?aspect=16:9&photo'
import { heroImage } from '@/lib/heroImage'
import { describeHours } from '@/lib/hours'
import { cafe } from './cafe'
import { homeDishes } from './home-dishes.generated'
import { homeSelection } from './home-selection'
import type { ImageAsset, Picture } from './images'
import { feastServes, type MenuItem, type Serves } from './menu'

/*
 * Photos come from assets-source/. They are the café's own photos from its
 * Google Maps listing and its dish posters (the README there gives each
 * file's source and crop); swap in originals from the café when it has them.
 * Each alt text describes the photo in that file: rewrite it with the photo.
 */

/** Gallery photos in file-name order (01.jpg first), cropped square. */
const galleryFiles = import.meta.glob<Picture>('/assets-source/gallery/*.jpg', {
  eager: true,
  import: 'default',
  query: '?aspect=1:1&photo',
})

/** Alt text for each gallery file, by name. The tests check every file has one. */
export const galleryAlts: Readonly<Record<string, string>> = {
  '01': 'Two layered desserts in eddy’s cups on a wooden table',
  '02': 'A pink iced drink in an eddy’s cup',
  '03': 'A coffee in an eddy’s mug on a wooden table',
  '04': 'Orange and red juices in glass bottles on a balcony',
  '05': 'An eddy’s takeaway bag on a table by the stairs',
  '06': 'Two poached eggs on toast with hollandaise, potatoes and sautéed mushrooms',
  '07': 'The eddy’s café sign on the front of the building',
  '08': 'Syrup bottles and espresso machines on the coffee counter',
  '09': 'Grey armchairs and wooden tables by the window in the dining room',
}

const galleryImages: ImageAsset[] = Object.entries(galleryFiles).map(([path, picture]) => ({
  alt: galleryAlts[path.slice(path.lastIndexOf('/') + 1, -'.jpg'.length)] ?? '',
  picture,
}))

function dish(id: string): MenuItem {
  const item = homeDishes[id]
  if (!item)
    throw new Error(`Dish not in home-dishes.generated.ts: ${id} (run npm run import:menu)`)
  return item
}

function lookup(table: Readonly<Record<string, string>>, id: string, what: string): string {
  const value = table[id]
  if (value === undefined) throw new Error(`No ${what} for ${id}`)
  return value
}

export interface Signature {
  item: MenuItem
  /** One line, shortened from the menu description. */
  summary: string
}

export interface Feast {
  item: MenuItem
  serves: Serves
  /** The menu description without the serving size, which is shown separately. */
  description: string
}

/** One-line versions of the menu descriptions. Facts only from the menu. */
const signatureSummaries: Readonly<Record<string, string>> = {
  'persian-style-lamb-chops': 'Eight Persian-marinated lamb chops, finished with edible gold leaf.',
  'chicken-spicy-moroccan-steak':
    'Grilled in North African spices, with baked potatoes and vegetables.',
  'chicken-cashew-nut': 'Chicken and vegetables in a Thai cashew sauce, with egg fried rice.',
  'chicken-chilli-cheese-pizza': 'Spicy chicken under melted cheese.',
  'eddys-katsu-club-sandwich': 'Crispy chicken katsu, slaw and Japanese mayo, with fries.',
  'hunter-beef-and-egg-sando':
    'Hunter beef, scrambled eggs and crispy potatoes in soft milk bread.',
}

/** Menu descriptions with the serving-size phrase removed; otherwise as published. */
const feastDescriptions: Readonly<Record<string, string>> = {
  'turkish-lamb-cheese-kebab':
    'Charcoal grilled lamb kebab stuffed with melted cheese & served chefs special sauces',
  'kamil-jooje':
    'Lebanese style grilled chicken platter with herbed rice, hummus, pita bread, sauces, fattoush salad',
  'beshghab-e-mix':
    'A generous mixed platter of grilled chicken, lamb meat, served with rice, hummus, pita bread, sauces, & salad',
  'eddys-khaas':
    'The ultimate Middle Eastern feast featuring premium grilled chicken, lamb, fish, served with rice, hummus, pita bread, sauces, & fattoush salad',
}

export const home = {
  hero: {
    positioning:
      'An all-day café and grill on Green Avenue, from Middle Eastern charcoal to specialty coffee.',
    image: {
      alt: 'Inside eddy’s: armchairs, sofas and wooden tables in the dining room',
      picture: heroNarrow,
      art: { media: heroImage.wideMedia, picture: heroWide },
    } satisfies ImageAsset,
  },

  intro: {
    title: 'Coffee, charcoal and everything between',
    // TODO(copy): replace with the café's own story (who runs it, when it
    // opened, what they care about). This draft only restates known facts.
    story: [
      `${cafe.name} sits at ${cafe.address.street}, on ${cafe.address.area} in ${cafe.address.city}.`,
      'The menu runs from Middle Eastern charcoal grills and steaks to pizza, bao, breakfast plates and a full coffee bar.',
      // Hours come from cafe.ts, so this line follows any change there.
      `Open ${describeHours(cafe.openingHours)}.`,
      'Eat in, take away, or order through foodpanda.',
    ],
    storyIsPlaceholder: true as boolean,
    image: {
      alt: 'The coffee counter under the eddy’s sign',
      picture: introPhoto,
    } satisfies ImageAsset,
  },

  signatures: {
    title: 'Signatures',
    intro: 'Six plates to start with.',
    items: homeSelection.signatures.map((id): Signature => ({
      item: dish(id),
      summary: lookup(signatureSummaries, id, 'signature summary'),
    })),
  },

  menuPreview: {
    title: 'From the menu',
    linkLabel: 'See the full menu',
    items: homeSelection.featured.map(dish),
  },

  feasts: {
    title: 'Feasts',
    intro: 'Platters for the whole table, from two people to six.',
    items: homeSelection.feasts.map((id): Feast => {
      const serves = feastServes[id]
      if (!serves) throw new Error(`No serving size for feast: ${id}`)
      return { item: dish(id), serves, description: lookup(feastDescriptions, id, 'description') }
    }),
    // TODO(photo): there's no photo of a sharing platter yet, so this is a grilled plate.
    image: {
      alt: 'Grilled chicken with fries, vegetables and a creamy sauce',
      picture: feastsPhoto,
    } satisfies ImageAsset,
  },

  drinks: {
    title: 'Coffee and cold drinks',
    coffeeTitle: 'Coffee',
    coffee: homeSelection.coffee.map(dish),
    coldTitle: 'Frappes and sodas',
    cold: homeSelection.cold.map(dish),
    linkLabel: 'All coffee and tea',
    linkTo: '/menu#coffee-tea',
    image: {
      alt: 'An iced coffee in an eddy’s cup beside a chocolate dessert',
      picture: drinksPhoto,
    } satisfies ImageAsset,
  },

  space: {
    // TODO(copy): a line about the room itself (seating, light, the terrace?).
    caption: `Dine in at ${cafe.address.street}, ${cafe.address.area}.`,
    captionIsPlaceholder: true as boolean,
    image: {
      alt: 'A corner table with a sofa bench beside the stairs',
      picture: spacePhoto,
    } satisfies ImageAsset,
  },

  gallery: {
    title: 'Around eddy’s',
    instagramLabel: `Follow ${cafe.instagramHandle} on Instagram`,
    images: galleryImages,
  },

  visit: {
    title: 'Visit',
    hoursTitle: 'Opening hours',
    // The storefront, so visitors know what to look for, inside the Google Maps link. (No map
    // image in the source material; an illustrated map could replace it as assets-source/map.jpg.)
    mapImage: {
      alt: 'The front of eddy’s Café on Green Avenue West',
      picture: mapPhoto,
    } satisfies ImageAsset,
  },

  closing: {
    line: 'Pull up a chair on Green Avenue.',
  },
} as const
