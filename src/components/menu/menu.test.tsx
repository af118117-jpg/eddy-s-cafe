import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { MenuGroupId } from '@/data'
import type { MenuEntry } from '@/data/menu-sections'
import MenuPage from '@/pages/Menu'
import { GroupTabs } from './GroupTabs'
import { MenuItemRow } from './MenuItemRow'

const steak: MenuEntry = {
  id: 'americano-steak',
  name: 'Americano Steak',
  description: 'Classic grilled steak finished with butter',
  kind: 'food',
  prices: [
    { amount: 1999, label: 'Chicken' },
    { amount: 2949, label: 'Beef' },
  ],
  tags: [{ kind: 'spicy' }, { kind: 'serves', serves: { min: 3, max: 4 } }],
  image: { alt: 'Americano steak' },
  itemIds: ['chicken-americano-steak', 'beef-americano-steak'],
  searchText: '',
}

function renderRow(entry: MenuEntry) {
  return render(
    <ul>
      <MenuItemRow entry={entry} />
    </ul>,
  )
}

describe('MenuItemRow', () => {
  it('shows variant prices as one line that reads as a list', () => {
    renderRow(steak)
    expect(screen.getByRole('heading', { level: 3, name: 'Americano Steak' })).toBeInTheDocument()
    const price = screen.getByText('Chicken').closest('p')
    // Visually "Chicken Rs 1,999 / Beef Rs 2,949"; screen readers get words, not symbols.
    expect(price?.textContent.replace(/\s+/g, ' ')).toBe(
      'Chicken RsRupees 1,999 / , Beef RsRupees 2,949',
    )
    expect(within(price as HTMLElement).getByText('/')).toHaveAttribute('aria-hidden', 'true')
  })

  it('lists tags, and reads a serving range in words', () => {
    renderRow(steak)
    const tags = screen.getAllByRole('listitem').slice(1)
    expect(tags.map((tag) => tag.textContent)).toEqual(['Spicy', 'Serves 3–43 to 4'])
  })

  it('shows a thumbnail only when the entry has a photo', () => {
    renderRow(steak)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    renderRow({
      ...steak,
      image: {
        alt: 'Steak',
        picture: {
          sources: { avif: '/images/steak.avif 480w', jpeg: '/images/steak.jpg 480w' },
          img: { src: '/images/steak.jpg', w: 480, h: 600 },
        },
      },
    })
    expect(screen.getByRole('img', { name: 'Steak' })).toBeInTheDocument()
  })
})

function Groups() {
  const [group, setGroup] = useState<MenuGroupId | null>('mains')
  return <GroupTabs value={group} onChange={setGroup} />
}

describe('GroupTabs keyboard', () => {
  it('is one Tab stop on the pressed chip, with arrow keys between chips', () => {
    render(<Groups />)
    const toolbar = screen.getByRole('toolbar', { name: 'Menu sections' })
    const chips = within(toolbar).getAllByRole('button')
    expect(chips.map((chip) => chip.tabIndex)).toEqual([-1, -1, 0, -1, -1, -1, -1, -1, -1])

    const mains = screen.getByRole('button', { name: 'Mains' })
    act(() => {
      mains.focus()
    })
    fireEvent.keyDown(mains, { key: 'ArrowRight' })
    const feasts = screen.getByRole('button', { name: 'Feasts' })
    expect(feasts).toHaveFocus()
    expect(feasts.tabIndex).toBe(0)
    expect(mains.tabIndex).toBe(-1)

    fireEvent.keyDown(feasts, { key: 'End' })
    expect(screen.getByRole('button', { name: 'Cold Drinks' })).toHaveFocus()
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' })
    const all = screen.getByRole('button', { name: 'All' })
    expect(all).toHaveFocus()

    fireEvent.click(all)
    expect(all).toHaveAttribute('aria-pressed', 'true')
    expect(mains).toHaveAttribute('aria-pressed', 'false')
  })
})

function renderMenu(url = '/menu') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <MenuPage />
    </MemoryRouter>,
  )
}

describe('Menu page', () => {
  it('has one h1, category h2s and dish h3s, and a live result count', () => {
    renderMenu()
    expect(screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent)).toEqual(['Menu'])
    expect(screen.getByRole('heading', { level: 2, name: 'Hot Coffee' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Hot Espresso' })).toBeInTheDocument()
    const count = screen.getByText('175 dishes and drinks')
    expect(count).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('link', { name: 'Order on foodpanda' })).toHaveAttribute(
      'href',
      expect.stringContaining('foodpanda'),
    )
    expect(screen.getByRole('searchbox', { name: 'Search the menu' })).toBeInTheDocument()
  })

  it('filters by group and category from the chips', () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Coffee & Tea' }))
    const categories = screen.getByRole('toolbar', { name: 'Categories' })
    expect(
      within(categories)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Hot Coffee', 'Cold Coffee', 'Tea Selection'])
    fireEvent.click(within(categories).getByRole('button', { name: 'Tea Selection' }))
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Tea Selection',
    ])
    expect(screen.getByText('4 drinks')).toBeInTheDocument()
  })

  it('shows the empty state, and Clear search brings everything back', () => {
    renderMenu('/menu?q=zzzz')
    expect(screen.getByText('No matches')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'No matches for “zzzz”' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Search the whole menu' })).not.toBeInTheDocument()

    // The field's own clear button has the same name and does the same thing.
    const [, emptyStateButton] = screen.getAllByRole('button', { name: 'Clear search' })
    fireEvent.click(emptyStateButton as HTMLElement)
    expect(screen.getByText('175 dishes and drinks')).toBeInTheDocument()
    const search = screen.getByRole('searchbox', { name: 'Search the menu' })
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
  })

  it('offers the whole menu when the search only misses in one group', () => {
    renderMenu('/menu?group=desserts&q=latte')
    expect(
      screen.getByRole('heading', { level: 2, name: 'No matches for “latte” in Desserts' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Search the whole menu' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Hot Spanish Latte' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clears the search with Escape and keeps focus in the field', () => {
    renderMenu('/menu?q=latte')
    const search = screen.getByRole('searchbox', { name: 'Search the menu' })
    act(() => {
      search.focus()
    })
    fireEvent.keyDown(search, { key: 'Escape' })
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
  })
})
