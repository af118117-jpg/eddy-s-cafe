import { useEffect, useRef, type RefObject } from 'react'
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
  toolbarRef: RefObject<HTMLDivElement>
  searchRef?: RefObject<HTMLInputElement>
}

/**
 * Marks the toolbar `data-stuck` while it's pinned under the header, using a
 * 1px sentinel just above it: once the sentinel passes the sticky line, the
 * toolbar is stuck. base.css then moves a stuck toolbar up into the header's
 * place while the header hides, with a transform. Its `top` never changes, so
 * the header hiding and showing causes no layout shift.
 */
function useStuckFlag(
  toolbarRef: RefObject<HTMLDivElement>,
  sentinelRef: RefObject<HTMLDivElement>,
) {
  useEffect(() => {
    const toolbar = toolbarRef.current
    const sentinel = sentinelRef.current
    if (!toolbar || !sentinel || typeof IntersectionObserver === 'undefined') return
    const stickyTop = parseFloat(getComputedStyle(toolbar).top) || 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        toolbar.toggleAttribute(
          'data-stuck',
          !entry.isIntersecting && entry.boundingClientRect.top < stickyTop,
        )
      },
      { rootMargin: `-${String(stickyTop)}px 0px 0px 0px` },
    )
    observer.observe(sentinel)
    return () => {
      observer.disconnect()
    }
  }, [toolbarRef, sentinelRef])
}

/**
 * Sticky under the header, moving up into its place while it hides. Every row is
 * a single line, so the toolbar never changes height while filtering.
 */
export function MenuToolbar({ filter, sections, toolbarRef, searchRef }: MenuToolbarProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  useStuckFlag(toolbarRef, sentinelRef)
  const categories = filter.group
    ? sections.filter((section) => section.group === filter.group)
    : sections
  const scope =
    sections.find((section) => section.id === filter.category)?.label ??
    (filter.group ? groupLabel(filter.group) : null)

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px -mb-px" />
      <div
        ref={toolbarRef}
        role="search"
        aria-label="Menu filters"
        data-follow-header
        // Named for the filter view transition: it shows its new state at once while the results crossfade.
        className="sticky top-(--header-height) z-20 border-y bg-bg py-3 [view-transition-name:menu-toolbar]"
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
    </>
  )
}
