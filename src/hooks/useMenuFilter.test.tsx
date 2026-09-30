import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { menuSections } from '@/data/menu-sections'
import { describeCount, filterMenu } from '@/lib/menuFilter'
import { normalizeSearch } from '@/lib/search'
import { useMenuFilter } from './useMenuFilter'

function setup(url = '/menu') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  )
  return renderHook(
    () => ({
      filter: useMenuFilter(menuSections),
      location: useLocation(),
      navigate: useNavigate(),
    }),
    { wrapper },
  )
}

const sectionIds = (sections: readonly { id: string }[]) => sections.map((section) => section.id)
const names = (sections: typeof menuSections) =>
  sections.flatMap((section) => section.entries.map((entry) => entry.name))

afterEach(() => {
  vi.useRealTimers()
})

describe('useMenuFilter: reading the URL', () => {
  it('shows the whole menu with no filters', () => {
    const { result } = setup()
    const { filter } = result.current
    expect(filter.group).toBeNull()
    expect(filter.category).toBeNull()
    expect(filter.count).toBe(175)
    expect(filter.sections).toHaveLength(menuSections.length)
    expect(describeCount(filter.sections)).toBe('175 dishes and drinks')
  })

  it('narrows to a group', () => {
    const { filter } = setup('/menu?group=coffee-tea').result.current
    expect(sectionIds(filter.sections)).toEqual(['hot-coffee', 'cold-coffee', 'tea-selection'])
    expect(describeCount(filter.sections)).toBe(`${String(filter.count)} drinks`)
  })

  it('narrows to a category inside a group', () => {
    const { filter } = setup('/menu?group=mains&category=steak-house').result.current
    expect(sectionIds(filter.sections)).toEqual(['steak-house'])
    expect(describeCount(filter.sections)).toBe('7 dishes')
  })

  it('accepts a category on its own', () => {
    const { filter } = setup('/menu?category=frappes').result.current
    expect(filter.group).toBeNull()
    expect(sectionIds(filter.sections)).toEqual(['frappes'])
  })

  it('ignores a category from another group, and unknown values', () => {
    const outside = setup('/menu?group=desserts&category=frappes').result.current.filter
    expect(outside.category).toBeNull()
    expect(sectionIds(outside.sections)).toEqual(['live-desserts'])

    const unknown = setup('/menu?group=brunch&category=nope').result.current.filter
    expect(unknown.group).toBeNull()
    expect(unknown.category).toBeNull()
    expect(unknown.count).toBe(175)
  })

  it('searches names, descriptions and category names', () => {
    const { filter } = setup('/menu?q=latte').result.current
    expect(filter.input).toBe('latte')
    expect(filter.count).toBeGreaterThan(0)
    for (const entry of filter.sections.flatMap((section) => section.entries)) {
      expect(entry.searchText).toContain('latte')
    }
    // "coffee" matches a category name, so every hot coffee is found.
    const coffee = filterMenu(menuSections, { group: null, category: null, query: 'coffee' })
    const hot = coffee.sections.find((section) => section.id === 'hot-coffee')
    expect(hot?.entries).toHaveLength(13)
  })

  it('combines search with a group', () => {
    const { filter } = setup('/menu?group=cold-drinks&q=mango').result.current
    expect(filter.count).toBeGreaterThan(0)
    expect(filter.sections.every((section) => section.group === 'cold-drinks')).toBe(true)
    expect(filter.menuWideCount).toBe(filter.count)
  })

  it('combines search with a category', () => {
    const { filter } = setup('/menu?category=hot-coffee&q=latte').result.current
    expect(sectionIds(filter.sections)).toEqual(['hot-coffee'])
    expect(names(filter.sections)).toContain('Hot Spanish Latte')
    expect(names(filter.sections)).not.toContain('Hot Americano')
  })

  it('reports matches elsewhere when a group has none', () => {
    const { filter } = setup('/menu?group=desserts&q=latte').result.current
    expect(filter.count).toBe(0)
    expect(filter.sections).toEqual([])
    expect(filter.menuWideCount).toBeGreaterThan(0)
    expect(describeCount(filter.sections)).toBe('No matches')
  })

  it('needs every word, and forgives case, accents and apostrophes', () => {
    const both = filterMenu(menuSections, { group: null, category: null, query: 'LAMB  kebab' })
    expect(names(both.sections)).toContain('Adana Kebab')
    expect(names(both.sections)).not.toContain('Hummus with Lamb')

    const eddys = names(
      filterMenu(menuSections, { group: null, category: null, query: 'eddys' }).sections,
    )
    expect(eddys).toContain("Eddy's Katsu Club Sandwich")
    expect(eddys).toContain("Eddy' s Khaas") // as published

    expect(normalizeSearch('Café  Latte & Crème')).toBe('cafe latte and creme')
    const cafe = filterMenu(menuSections, { group: null, category: null, query: 'café latte' })
    expect(names(cafe.sections)).toContain('Hot Cafe Latte')
  })

  it('matches the start of words, not the middle', () => {
    const search = (query: string) =>
      filterMenu(menuSections, { group: null, category: null, query }).sections
    // "latte" is inside "platter", "iced" inside "sliced" and "spiced".
    expect(sectionIds(search('latte'))).not.toContain('sharing-platters')
    const iced = sectionIds(search('iced'))
    expect(iced).toContain('cold-coffee')
    expect(iced).not.toContain('middle-eastern-starters') // "Spiced lamb shawarma"
    expect(iced).not.toContain('tropical-and-asian-mains') // "Sliced chicken"
    // A word being typed still matches.
    expect(names(search('cappu'))).toContain('Hot Cappuccino')
  })

  it('finds merged variants by their full published names', () => {
    const { sections } = filterMenu(menuSections, {
      group: null,
      category: null,
      query: 'beef americano',
    })
    expect(names(sections)).toEqual(['Americano Steak'])
  })
})

describe('useMenuFilter: writing the URL', () => {
  it('sets a group, clearing the category but keeping the search', () => {
    const { result } = setup('/menu?group=mains&category=steak-house&q=chicken')
    act(() => {
      result.current.filter.setGroup('desserts')
    })
    expect(result.current.location.search).toBe('?group=desserts&q=chicken')
    act(() => {
      result.current.filter.setGroup(null)
    })
    expect(result.current.location.search).toBe('?q=chicken')
  })

  it('sets and clears a category', () => {
    const { result } = setup('/menu?group=coffee-tea')
    act(() => {
      result.current.filter.setCategory('cold-coffee')
    })
    expect(result.current.location.search).toBe('?group=coffee-tea&category=cold-coffee')
    expect(sectionIds(result.current.filter.sections)).toEqual(['cold-coffee'])
    act(() => {
      result.current.filter.setCategory(null)
    })
    expect(result.current.location.search).toBe('?group=coffee-tea')
  })

  it('filters as you type and writes ?q= after a pause', () => {
    vi.useFakeTimers()
    const { result } = setup('/menu?group=cold-drinks')
    act(() => {
      result.current.filter.setInput('mango')
    })
    expect(result.current.filter.input).toBe('mango')
    expect(result.current.filter.query).toBe('mango')
    expect(result.current.location.search).toBe('?group=cold-drinks')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.location.search).toBe('?group=cold-drinks&q=mango')
  })

  it('clears the search, and can widen it to the whole menu', () => {
    const { result } = setup('/menu?group=desserts&q=latte')
    act(() => {
      result.current.filter.searchWholeMenu()
    })
    expect(result.current.location.search).toBe('?q=latte')
    expect(result.current.filter.count).toBeGreaterThan(0)
    act(() => {
      result.current.filter.clearSearch()
    })
    expect(result.current.filter.input).toBe('')
    expect(result.current.location.search).toBe('')
    expect(result.current.filter.count).toBe(175)
  })

  it('replaces the history entry, so Back leaves the filtered menu', () => {
    const { result } = setup('/')
    act(() => {
      void result.current.navigate('/menu')
    })
    act(() => {
      result.current.filter.setGroup('desserts')
    })
    act(() => {
      void result.current.navigate(-1)
    })
    expect(result.current.location.pathname).toBe('/')
  })

  it('takes the search from the URL again on Back and Forward', () => {
    const { result } = setup('/menu?q=latte')
    act(() => {
      void result.current.navigate('/menu?q=mango')
    })
    expect(result.current.filter.input).toBe('mango')
    act(() => {
      void result.current.navigate(-1)
    })
    expect(result.current.filter.input).toBe('latte')
    expect(names(result.current.filter.sections)).toContain('Hot Spanish Latte')
  })
})
