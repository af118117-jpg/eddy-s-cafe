import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { NavigationType, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { menuGroups, type MenuGroupId } from '@/data/menu'
import type { MenuSection } from '@/data/menu-sections'
import { filterMenu, type MenuFilter, type MenuResults } from '@/lib/menuFilter'

/*
 * Typing updates the results at once but writes ?q= to the URL only after a
 * pause: Safari throws if history.replaceState runs more than 100 times in
 * 30 seconds.
 */
const QUERY_URL_DELAY_MS = 300

const groupIds = new Set<string>(menuGroups.map((group) => group.id))

function isGroupId(value: string | null): value is MenuGroupId {
  return value !== null && groupIds.has(value)
}

/** Reads ?group=&category=&q=, dropping unknown values and a category outside the group. */
export function readMenuFilter(search: string, sections: readonly MenuSection[]): MenuFilter {
  const params = new URLSearchParams(search)
  const rawGroup = params.get('group')
  const group = isGroupId(rawGroup) ? rawGroup : null
  const section = sections.find((s) => s.id === params.get('category'))
  const category = section && (group === null || section.group === group) ? section.id : null
  return { group, category, query: params.get('q') ?? '' }
}

export function menuFilterSearch({ group, category, query }: MenuFilter): string {
  const params = new URLSearchParams()
  if (group) params.set('group', group)
  if (category) params.set('category', category)
  if (query) params.set('q', query)
  const search = params.toString()
  return search ? `?${search}` : ''
}

export interface MenuFilterState extends MenuFilter, MenuResults {
  /** What's in the search box now. `query` is the deferred copy the results use. */
  input: string
  setGroup: (group: MenuGroupId | null) => void
  setCategory: (category: string | null) => void
  setInput: (value: string) => void
  clearSearch: () => void
  /** Keeps the search, drops the group and category. */
  searchWholeMenu: () => void
}

/**
 * Menu filters, kept in the URL (?group=&category=&q=) so a filtered menu can
 * be shared and comes back after the back button. Updates replace the history
 * entry, so Back leaves the menu instead of stepping through every chip.
 */
export function useMenuFilter(sections: readonly MenuSection[]): MenuFilterState {
  const location = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  const {
    group,
    category,
    query: urlQuery,
  } = useMemo(() => readMenuFilter(location.search, sections), [location.search, sections])

  // The search box keeps its own state, so typing never waits for the router.
  const [input, setInput] = useState(urlQuery)
  const [locationKey, setLocationKey] = useState(location.key)
  if (location.key !== locationKey) {
    setLocationKey(location.key)
    // Our own updates replace the entry. Anything else (Back, a link to /menu) brings its own search.
    if (navigationType !== NavigationType.Replace) setInput(urlQuery)
  }
  const query = useDeferredValue(input)

  const write = useCallback(
    (next: MenuFilter) => {
      void navigate({ search: menuFilterSearch(next) }, { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    if (input === urlQuery) return
    const timer = window.setTimeout(() => {
      write({ group, category, query: input })
    }, QUERY_URL_DELAY_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [input, urlQuery, group, category, write])

  const results = useMemo(
    () => filterMenu(sections, { group, category, query }),
    [sections, group, category, query],
  )

  return {
    group,
    category,
    query,
    input,
    ...results,
    setGroup: (next) => {
      write({ group: next, category: null, query: input })
    },
    setCategory: (next) => {
      write({ group, category: next, query: input })
    },
    setInput,
    clearSearch: () => {
      setInput('')
      write({ group, category, query: '' })
    },
    searchWholeMenu: () => {
      write({ group: null, category: null, query: input })
    },
  }
}
