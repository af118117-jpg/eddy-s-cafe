/*
 * Which dishes the home page shows, by menu id (see menu.generated.ts).
 * After changing this file, run `npm run import:menu`: it writes just these
 * dishes to home-dishes.generated.ts, so the home page doesn't ship the whole
 * menu. No imports here: the import script reads this file directly.
 */
export const homeSelection = {
  /** The café's own promo photos exist for these. The first is the large one. */
  signatures: [
    'persian-style-lamb-chops',
    'chicken-spicy-moroccan-steak',
    'chicken-cashew-nut',
    'chicken-chilli-cheese-pizza',
    'eddys-katsu-club-sandwich',
    'hunter-beef-and-egg-sando',
  ],
  /** Two each from four groups, so every filter chip shows something. */
  featured: [
    'hummus-with-lamb',
    'dynamite-prawns',
    'adana-kebab',
    'chicken-ala-kiev',
    'porcini-pizza',
    'mama-mia-pasta',
    'molten-lava-with-ice-cream',
    'croissant-and-butter-pudding',
  ],
  feasts: ['turkish-lamb-cheese-kebab', 'kamil-jooje', 'beshghab-e-mix', 'eddys-khaas'],
  coffee: [
    'hot-espresso',
    'hot-americano',
    'hot-cappuccino',
    'hot-cafe-latte',
    'hot-spanish-latte',
    'iced-spanish-latte',
  ],
  cold: [
    'caramel-frappe',
    'lotus-frappe',
    'voltage-frappe',
    'mint-margarita',
    'blue-lagoon',
    'strawberry-mint-margarita',
  ],
} as const
