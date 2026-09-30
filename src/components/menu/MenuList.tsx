import { memo } from 'react'
import type { MenuGroupId } from '@/data'
import type { MenuSection } from '@/data/menu-sections'
import { MenuCategoryBlock } from './MenuCategoryBlock'

function byGroup(sections: readonly MenuSection[]) {
  const groups: { id: MenuGroupId; sections: MenuSection[] }[] = []
  for (const section of sections) {
    const last = groups.at(-1)
    if (last?.id === section.group) last.sections.push(section)
    else groups.push({ id: section.group, sections: [section] })
  }
  return groups
}

/**
 * The results, category by category. Each group's categories share a wrapper
 * with the group's id, so /menu#coffee-tea lands on its first category.
 *
 * Memoised: while typing, the page re-renders for the search box at once and
 * this list only when the deferred results change.
 */
export const MenuList = memo(function MenuList({ sections }: { sections: readonly MenuSection[] }) {
  return byGroup(sections).map((group) => (
    <div key={group.id} id={group.id} className="scroll-mt-(--menu-toolbar-height)">
      {group.sections.map((section) => (
        <MenuCategoryBlock key={section.id} section={section} />
      ))}
    </div>
  ))
})
