import { forwardRef, type RefObject } from 'react'
import { groupLabel } from '@/data'
import type { MenuSection } from '@/data/menu-sections'
import type { MenuFilterState } from '@/hooks/useMenuFilter'
import { CategoryChips } from './CategoryChips'
import { GroupTabs } from './GroupTabs'
import { MenuSearch } from './MenuSearch'

interface MenuToolbarProps {
  filter: MenuFilterState
  /** Every section, for the category chips. */
  sections: readonly MenuSection[]
  searchRef?: RefObject<HTMLInputElement>
}

/**
 * Sticky under the header, moving up into its place while it hides. Every row is
 * a single line, so the toolbar never changes height while filtering.
 */
export const MenuToolbar = forwardRef<HTMLDivElement, MenuToolbarProps>(function MenuToolbar(
  { filter, sections, searchRef },
  ref,
) {
  const categories = filter.group
    ? sections.filter((section) => section.group === filter.group)
    : sections
  const scope =
    sections.find((section) => section.id === filter.category)?.label ??
    (filter.group ? groupLabel(filter.group) : null)

  return (
    <div
      ref={ref}
      role="search"
      aria-label="Menu filters"
      className="sticky top-(--header-height) z-20 border-y bg-bg py-3 transition-[top] duration-(--duration-standard) ease-standard header-hidden:top-0"
    >
      <div className="container flex flex-col gap-2">
        <GroupTabs value={filter.group} onChange={filter.setGroup} />
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
          <CategoryChips
            sections={categories}
            value={filter.category}
            onChange={filter.setCategory}
            className="min-w-0 md:flex-1"
          />
          <MenuSearch
            value={filter.input}
            onChange={filter.setInput}
            onClear={filter.clearSearch}
            placeholder={scope ? `Search ${scope}` : 'Search dishes and drinks'}
            inputRef={searchRef}
            className="md:basis-1/3 md:shrink-0 xl:basis-1/4"
          />
        </div>
      </div>
    </div>
  )
})
