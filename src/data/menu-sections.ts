/*
 * The menu page's view of the menu: the 182 items arranged into categories
 * (in group order), with Chicken/Beef versions of the same dish merged into
 * one row. Imports the full menu, so only the lazy menu page should use it.
 */
import { normalizeSearch } from '@/lib/search'
import { slugify } from '@/lib/slug'
import type { ImageAsset } from './images'
import {
  categoryGroup,
  feastServes,
  menuGroups,
  type MenuCategory,
  type MenuGroupId,
  type MenuItem,
  type Serves,
} from './menu'
import { menuItems } from './menu-items'

export interface MenuPrice {
  /** Whole rupees. */
  amount: number
  from?: boolean
  /** The variant this price is for, e.g. "Chicken". */
  label?: string
}

export type MenuTag = { kind: 'spicy' } | { kind: 'serves'; serves: Serves }

/** One row on the menu page: a single item, or the variants of one dish. */
export interface MenuEntry {
  /** The item's id, or for merged variants the slug of the shared name. */
  id: string
  name: string
  description: string
  kind: 'food' | 'drink'
  prices: readonly MenuPrice[]
  tags: readonly MenuTag[]
  image: ImageAsset
  /** The menu items this row stands for (two for a Chicken/Beef dish). */
  itemIds: readonly string[]
  /** Names, description and category, folded by normalizeSearch. */
  searchText: string
}

/** A category block on the menu page, with its anchor id. */
export interface MenuSection {
  id: string
  label: string
  group: MenuGroupId
  entries: readonly MenuEntry[]
}

/**
 * PROPOSAL: dishes the published menu itself calls spicy, tagged "Spicy" on
 * the menu page. Left out on purpose, because only a side or dip is spicy:
 * Chicken Butter Milk Burger ("spicy mayo"), Stuff Chicken Fingers ("served
 * with spicy sauce"), Hunter Beef & Egg Sando ("served with spicy fries").
 */
export const spicyDishes: ReadonlySet<string> = new Set([
  'hot-and-sour-soup', // "medium spicy chicken broth"
  'sichuan-burger', // "Spicy chicken fried fillet"
  'chicken-spicy-moroccan-steak', // named Spicy
  'beef-spicy-moroccan-steak', // named Spicy
  'chicken-chilli-cheese-pizza', // "Spicy chicken"
  'hot-chicken-bao', // "Spicy fried chicken"
  'nashville-chicken', // "spicy fried chicken"
  'chicken-chilli-dry', // "cooked with spicy chillies"
  'beef-chilli-dry', // "cooked with spicy chillies"
  'penny-arbiata-pasta', // "cooked in spicy tomato sauce"
  'dynamite-prawns', // "coated in creamy & spicy dynamite sauce"
  'masala-fries', // "spicy masala"
])

/* The platters are listed under "Middle Eastern Main" at source; on the menu page they get their own block in Feasts. */
const PLATTERS = { id: 'sharing-platters', label: 'Sharing platters' } as const

/*
 * "Chicken Americano Steak" / "Beef Americano Steak" and "Teragon Steak
 * (Chicken)" / "Teragon Steak (Beef)" are one dish in two versions. They are
 * merged only when the category and description match exactly as well.
 */
const VARIANT_PREFIX = /^(Chicken|Beef) (.+)$/
const VARIANT_SUFFIX = /^(.+) \((Chicken|Beef)\)$/

function splitVariant(name: string): { base: string; label: string } | null {
  const prefix = VARIANT_PREFIX.exec(name)
  if (prefix?.[1] && prefix[2]) return { base: prefix[2], label: prefix[1] }
  const suffix = VARIANT_SUFFIX.exec(name)
  if (suffix?.[1] && suffix[2]) return { base: suffix[1], label: suffix[2] }
  return null
}

function tagsFor(items: readonly MenuItem[]): MenuTag[] {
  const tags: MenuTag[] = []
  const serves = items.map((item) => feastServes[item.id]).find(Boolean)
  if (serves) tags.push({ kind: 'serves', serves })
  if (items.some((item) => spicyDishes.has(item.id))) tags.push({ kind: 'spicy' })
  return tags
}

function toEntry(
  id: string,
  name: string,
  items: readonly [MenuItem, ...MenuItem[]],
  prices: MenuPrice[],
  sectionLabel: string,
): MenuEntry {
  const [first] = items
  return {
    id,
    name,
    description: first.description,
    kind: first.section,
    prices,
    tags: tagsFor(items),
    image: items.find((item) => item.image.src)?.image ?? first.image,
    itemIds: items.map((item) => item.id),
    searchText: normalizeSearch(
      [...items.map((item) => item.name), first.description, sectionLabel].join(' '),
    ),
  }
}

/** Items of one category, in menu order, with variants merged into the first one's place. */
export function toEntries(items: readonly MenuItem[], sectionLabel: string): MenuEntry[] {
  const variants = new Map<string, { item: MenuItem; label: string }[]>()
  for (const item of items) {
    const variant = splitVariant(item.name)
    if (!variant) continue
    const key = `${variant.base}\n${item.description}`
    variants.set(key, [...(variants.get(key) ?? []), { item, label: variant.label }])
  }

  const merged = new Set<string>()
  const entries: MenuEntry[] = []
  for (const item of items) {
    if (merged.has(item.id)) continue
    const variant = splitVariant(item.name)
    const group = variant ? (variants.get(`${variant.base}\n${item.description}`) ?? []) : []

    if (variant && group.length > 1) {
      for (const member of group) merged.add(member.item.id)
      const groupItems = group.map((member) => member.item)
      entries.push(
        toEntry(
          slugify(variant.base),
          variant.base,
          [item, ...groupItems.filter((other) => other !== item)],
          group.map(({ item: member, label }) => ({
            amount: member.price,
            from: member.priceFrom,
            label,
          })),
          sectionLabel,
        ),
      )
    } else {
      entries.push(
        toEntry(
          item.id,
          item.name,
          [item],
          [{ amount: item.price, from: item.priceFrom }],
          sectionLabel,
        ),
      )
    }
  }
  return entries
}

/** Every category as a section, groups in PLAN order, categories in `categoryGroup` order. */
export function buildMenuSections(items: readonly MenuItem[]): MenuSection[] {
  const categories = Object.keys(categoryGroup) as MenuCategory[]
  const sections: MenuSection[] = []

  for (const group of menuGroups) {
    if (group.id === 'feasts') {
      const platters = items.filter((item) => item.id in feastServes)
      sections.push({ ...PLATTERS, group: group.id, entries: toEntries(platters, PLATTERS.label) })
      continue
    }
    for (const category of categories.filter((c) => categoryGroup[c] === group.id)) {
      const inCategory = items.filter(
        (item) => item.category === category && !(item.id in feastServes),
      )
      if (inCategory.length === 0) continue
      sections.push({
        id: slugify(category),
        label: category,
        group: group.id,
        entries: toEntries(inCategory, category),
      })
    }
  }
  return sections
}

export const menuSections: readonly MenuSection[] = buildMenuSections(menuItems)
