/*
 * Menu types and groups. Deliberately has no runtime import of the menu data,
 * so pages that only need a few dishes don't bundle all 182: use
 * `./menu-items` for the full list.
 */
import { dishPhoto } from './dish-photos'
import type { ImageAsset } from './images'

export type MenuCategory = (typeof import('./menu.generated').menuCategories)[number]

export interface MenuItem {
  /** Slug of the name, unique across the menu. */
  id: string
  /** As published, spelling included. */
  name: string
  description: string
  /** Whole rupees. */
  price: number
  /** Price is a starting price (sizes or options). */
  priceFrom?: boolean
  category: MenuCategory
  section: 'food' | 'drink'
}

export type MenuGroupId =
  | 'starters'
  | 'mains'
  | 'feasts'
  | 'pizza-pasta'
  | 'burgers-sandwiches'
  | 'desserts'
  | 'coffee-tea'
  | 'cold-drinks'

export interface MenuGroup {
  id: MenuGroupId
  label: string
}

/** The eight groups from docs/PLAN.md, in menu order. */
export const menuGroups: readonly MenuGroup[] = [
  { id: 'starters', label: 'Starters & Small Plates' },
  { id: 'mains', label: 'Mains' },
  { id: 'feasts', label: 'Feasts' },
  { id: 'pizza-pasta', label: 'Pizza & Pasta' },
  { id: 'burgers-sandwiches', label: 'Burgers & Sandwiches' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'coffee-tea', label: 'Coffee & Tea' },
  { id: 'cold-drinks', label: 'Cold Drinks' },
]

/*
 * PROPOSAL, to confirm with the café: which of the 25 source categories
 * belongs to which group. `Record` makes the compiler insist every category
 * is mapped. The menu page lists categories in this order within each group.
 */
export const categoryGroup: Readonly<Record<MenuCategory, MenuGroupId>> = {
  'Middle Eastern Starters': 'starters',
  Appetizers: 'starters',
  Soups: 'starters',
  Salad: 'starters',
  'Bao Station': 'starters',
  'Middle Eastern Main': 'mains',
  'Steak House': 'mains',
  'Gourmet Selection': 'mains',
  'Tropical and Asian Mains': 'mains',
  Breakfast: 'mains', // PROPOSAL: no breakfast group in PLAN.md
  Pizza: 'pizza-pasta',
  Pasta: 'pizza-pasta',
  Burgers: 'burgers-sandwiches',
  Sandwiches: 'burgers-sandwiches',
  'Live Desserts': 'desserts',
  'Hot Coffee': 'coffee-tea',
  'Cold Coffee': 'coffee-tea',
  'Tea Selection': 'coffee-tea',
  'Cold Tea': 'cold-drinks',
  'Cold Beverages': 'cold-drinks',
  'Homemade Sodas': 'cold-drinks',
  Frappes: 'cold-drinks',
  Shakes: 'cold-drinks',
  'Fruity Chillers': 'cold-drinks',
  'Fruity Smoothies': 'cold-drinks',
}

export interface Serves {
  min: number
  max: number
}

/**
 * Sharing platters. Listed under "Middle Eastern Main" at source; grouped as
 * Feasts here. Serving sizes come from each item's description.
 */
export const feastServes: Readonly<Record<string, Serves>> = {
  'turkish-lamb-cheese-kebab': { min: 2, max: 2 }, // "Serving for 2 persons."
  'kamil-jooje': { min: 3, max: 4 }, // "perfect for 3 & 4 guests"
  'beshghab-e-mix': { min: 4, max: 4 }, // "Serving for 4 persons."
  'eddys-khaas': { min: 6, max: 6 }, // "Servig for 6 persond." (as published)
}

/** The dish's photo (src/data/dish-photos.ts), or its placeholder slot (alt text = the dish name). */
export function dishImage(item: MenuItem): ImageAsset {
  return dishPhoto(item.id, item.name)
}

export function groupOf(item: MenuItem): MenuGroupId {
  return item.id in feastServes ? 'feasts' : categoryGroup[item.category]
}

export function groupLabel(id: MenuGroupId): string {
  return menuGroups.find((group) => group.id === id)?.label ?? id
}
