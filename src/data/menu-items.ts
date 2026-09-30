/*
 * The whole menu (182 items, ~10 KB gzipped). Import this only from code that
 * needs all of it, such as the lazy-loaded menu page; the home page uses
 * home-dishes.generated.ts instead.
 */
import type { MenuItem } from './menu'
import { menuCategories, menuItems } from './menu.generated'

const itemsById = new Map(menuItems.map((item) => [item.id, item]))

/** Looks up an item by id; throws so a typo in page content fails loudly. */
export function getMenuItem(id: string): MenuItem {
  const item = itemsById.get(id)
  if (!item) throw new Error(`Unknown menu item: ${id}`)
  return item
}

export { menuCategories, menuItems }
