import type { MenuSection } from '@/data/menu-sections'
import { MenuItemRow } from './MenuItemRow'

/**
 * One category: an h2 with the category's anchor (/menu#hot-coffee), then its
 * rows (two columns from lg). Anchor jumps stop below the sticky toolbar.
 */
export function MenuCategoryBlock({ section }: { section: MenuSection }) {
  const titleId = `${section.id}-title`
  return (
    <section
      id={section.id}
      aria-labelledby={titleId}
      className="grid-layout scroll-mt-(--menu-toolbar-height) gap-y-6 border-t py-12"
    >
      <h2 id={titleId} className="col-span-4 text-h3 lg:col-span-3">
        {section.label}
      </h2>
      <ul className="col-span-4 grid gap-y-8 lg:col-span-9 lg:grid-cols-2 lg:gap-x-gutter-lg">
        {section.entries.map((entry) => (
          <MenuItemRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  )
}
