import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EmptyState, MenuList, MenuToolbar } from '@/components/menu'
import { Button } from '@/components/ui'
import { cafe, groupLabel, menuPage } from '@/data'
import type { MenuGroupId } from '@/data'
import { menuSections, type MenuSection } from '@/data/menu-sections'
import { useCrossfade } from '@/hooks/useCrossfade'
// Straight from the module: through the hooks index it would land in the main bundle.
import { useMenuFilter, type MenuFilterState } from '@/hooks/useMenuFilter'
import { describeCount } from '@/lib/menuFilter'

/** About two screens of dishes on a phone: what the first render shows. */
const FIRST_ENTRIES = 24

/** The first sections, up to about `entries` dishes (whole sections only). */
function firstSections(sections: readonly MenuSection[], entries: number): readonly MenuSection[] {
  const shown: MenuSection[] = []
  let count = 0
  for (const section of sections) {
    if (count >= entries) break
    shown.push(section)
    count += section.entries.length
  }
  return shown
}

/** The full menu: filter by group and category, search, share the result by URL. */
export default function Menu() {
  const filter = useMenuFilter(menuSections)
  const pageRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // The first render shows the first sections only; the rest follows at once in
  // a transition, which React renders in small slices. Rendering all 180 dishes
  // in one go is a single long task that keeps a slow phone from responding.
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    startTransition(() => {
      setComplete(true)
    })
  }, [])
  const shownSections = useMemo(
    () => (complete ? filter.sections : firstSections(filter.sections, FIRST_ENTRIES)),
    [complete, filter.sections],
  )

  // Category anchors stop below the sticky toolbar: its height, for scroll-margin.
  useLayoutEffect(() => {
    const page = pageRef.current
    const toolbar = toolbarRef.current
    if (!page || !toolbar) return
    const update = () => {
      page.style.setProperty('--menu-toolbar-height', `${String(toolbar.offsetHeight)}px`)
    }
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(toolbar)
    return () => {
      observer.disconnect()
    }
  }, [])

  // After a filter change, if the results start above the toolbar, show them from the top.
  const filterKey = [filter.group, filter.category, filter.query].join('\n')
  const shownKey = useRef(filterKey)
  useLayoutEffect(() => {
    if (shownKey.current === filterKey) return
    shownKey.current = filterKey
    const results = resultsRef.current
    const toolbar = toolbarRef.current
    if (!results || !toolbar) return
    const header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const top = results.getBoundingClientRect().top + window.scrollY - header - toolbar.offsetHeight
    if (window.scrollY > top) window.scrollTo({ top })
  }, [filterKey])

  // Chip and empty-state changes crossfade the results; typing in the search updates them directly.
  const crossfade = useCrossfade(filterKey, resultsRef)
  const actions: Pick<
    MenuFilterState,
    'setGroup' | 'setCategory' | 'clearSearch' | 'searchWholeMenu'
  > = {
    setGroup: (group: MenuGroupId | null) => {
      if (group === filter.group && filter.category === null) return
      crossfade(() => {
        filter.setGroup(group)
      })
    },
    setCategory: (category: string | null) => {
      if (category === filter.category) return
      crossfade(() => {
        filter.setCategory(category)
      })
    },
    clearSearch: () => {
      if (!filter.input) return
      crossfade(filter.clearSearch)
    },
    searchWholeMenu: () => {
      crossfade(filter.searchWholeMenu)
    },
  }

  const scope =
    menuSections.find((section) => section.id === filter.category)?.label ??
    (filter.group ? groupLabel(filter.group) : null)

  return (
    <div ref={pageRef}>
      <div className="container flex flex-col items-start gap-8 pt-16 pb-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-h2">{menuPage.title}</h1>
          <p className="prose-width text-body-lg text-ink-muted">{menuPage.intro}</p>
        </div>
        <Button href={cafe.links.foodpanda} variant="secondary" className="shrink-0">
          {menuPage.orderLabel}
        </Button>
      </div>

      <MenuToolbar
        filter={{ ...filter, ...actions }}
        sections={menuSections}
        toolbarRef={toolbarRef}
        searchRef={searchRef}
      />

      <div ref={resultsRef} className="container pb-section">
        <p aria-live="polite" aria-atomic="true" className="py-6 text-small text-ink-muted">
          {describeCount(filter.sections)}
        </p>
        {filter.count > 0 ? (
          <MenuList sections={shownSections} />
        ) : (
          <EmptyState
            query={filter.query}
            scope={scope}
            menuWideCount={filter.menuWideCount}
            onClearSearch={() => {
              actions.clearSearch()
              searchRef.current?.focus()
            }}
            onSearchWholeMenu={() => {
              actions.searchWholeMenu()
              searchRef.current?.focus()
            }}
          />
        )}
      </div>
    </div>
  )
}
