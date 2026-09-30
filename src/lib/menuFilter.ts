import type { MenuGroupId } from '@/data/menu'
import type { MenuEntry, MenuSection } from '@/data/menu-sections'
import { searchTerms } from './search'

export interface MenuFilter {
  /** null: every group. */
  group: MenuGroupId | null
  /** A section id; null: every category in the group. */
  category: string | null
  query: string
}

export interface MenuResults {
  /** Sections with at least one match, holding only their matching entries. */
  sections: readonly MenuSection[]
  /** Rows shown. */
  count: number
  /** Rows the query matches across the whole menu, ignoring group and category. */
  menuWideCount: number
}

/** Every term starts a word: "lat" finds Latte, but "latte" doesn't find Platter. */
function matches(entry: MenuEntry, terms: readonly string[]): boolean {
  const text = ` ${entry.searchText}`
  return terms.every((term) => text.includes(` ${term}`))
}

/** Narrows to the group, then the category, then entries matching every search term. */
export function filterMenu(
  sections: readonly MenuSection[],
  { group, category, query }: MenuFilter,
): MenuResults {
  const terms = searchTerms(query)
  const keep = (entries: readonly MenuEntry[]) =>
    terms.length === 0 ? entries : entries.filter((entry) => matches(entry, terms))

  const results = sections
    .filter(
      (section) =>
        (group === null || section.group === group) &&
        (category === null || section.id === category),
    )
    .map((section) => ({ ...section, entries: keep(section.entries) }))
    .filter((section) => section.entries.length > 0)

  return {
    sections: results,
    count: results.reduce((total, section) => total + section.entries.length, 0),
    menuWideCount: sections.reduce((total, section) => total + keep(section.entries).length, 0),
  }
}

/** "24 dishes", "1 drink", "175 dishes and drinks", "No matches". */
export function describeCount(sections: readonly MenuSection[]): string {
  const entries = sections.flatMap((section) => section.entries)
  const count = entries.length
  if (count === 0) return 'No matches'
  const food = entries.some((entry) => entry.kind === 'food')
  const drink = entries.some((entry) => entry.kind === 'drink')
  if (food && drink) return `${String(count)} dishes and drinks`
  const noun = food ? 'dish' : 'drink'
  return `${String(count)} ${noun}${count === 1 ? '' : noun === 'dish' ? 'es' : 's'}`
}
