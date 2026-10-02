/*
 * Home page content: copy and photo slots. Which dishes appear is set in
 * home-selection.ts; names, descriptions and prices come from the menu data.
 * Search for "TODO(copy)" for placeholders to replace.
 */
import { cafe } from './cafe'
import { homeDishes } from './home-dishes.generated'
import { homeSelection } from './home-selection'
import type { ImageAsset } from './images'
import { feastServes, type MenuItem, type Serves } from './menu'

/** Photo slot still waiting for a chosen, optimised photo (Phase 7). */
function slot(alt: string, source?: string): ImageAsset {
  return source ? { alt, source, sourceKind: 'own' } : { alt }
}

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
    image: slot('TODO(copy): describe the hero photo'),
  },

  intro: {
    title: 'Coffee, charcoal and everything between',
    // TODO(copy): replace with the café's own story (who runs it, when it
    // opened, what they care about). This draft only restates known facts.
    story: [
      `${cafe.name} sits at ${cafe.address.street}, on ${cafe.address.area} in ${cafe.address.city}.`,
      'The menu runs from Middle Eastern charcoal grills and steaks to pizza, bao, breakfast plates and a full coffee bar.',
      'Doors open at 11 AM every day and stay open until 1 AM, or 2 AM from Friday to Sunday.',
      'Eat in, take away, or order through foodpanda.',
    ],
    storyIsPlaceholder: true as boolean,
    image: slot('TODO(copy): describe the intro photo'),
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
    image: slot('TODO(copy): describe the feasts photo'),
  },

  drinks: {
    title: 'Coffee and cold drinks',
    coffeeTitle: 'Coffee',
    coffee: homeSelection.coffee.map(dish),
    coldTitle: 'Frappes and sodas',
    cold: homeSelection.cold.map(dish),
    linkLabel: 'All coffee and tea',
    linkTo: '/menu#coffee-tea',
    image: slot('TODO(copy): describe the coffee photo'),
  },

  space: {
    // TODO(copy): a line about the room itself (seating, light, the terrace?).
    caption: 'Eat in on Green Avenue West, open until 2 AM from Friday to Sunday.',
    captionIsPlaceholder: true as boolean,
    image: slot('TODO(copy): describe the interior photo'),
  },

  gallery: {
    title: 'Around eddy’s',
    instagramLabel: `Follow ${cafe.instagramHandle} on Instagram`,
    images: [
      slot(
        'Two layered desserts in eddy’s cups on a wooden table',
        '01-Google-Maps-Photos/google-maps-24.jpg',
      ),
      ...Array.from({ length: 8 }, (_, index) =>
        slot(`TODO(copy): describe gallery photo ${String(index + 2)}`),
      ),
    ],
  },

  visit: {
    title: 'Visit',
    hoursTitle: 'Opening hours',
    mapImage: slot('TODO(copy): map of the area around the café'),
  },

  closing: {
    line: 'Pull up a chair on Green Avenue.',
  },
} as const
