import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cafe } from '@/data'
import Home from '@/pages/Home'
import { HoursTable } from './HoursTable'
import { MenuPreview } from './MenuPreview'

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home page', () => {
  it('uses the wordmark as the only h1 and never skips a heading level', () => {
    renderHome()
    const levels = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) =>
      Number(heading.tagName.slice(1)),
    )
    expect(levels[0]).toBe(1)
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    levels.forEach((level, index) => {
      const previous = levels[index - 1] ?? 0
      expect(level - previous).toBeLessThanOrEqual(1)
    })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('eddy’s Café')
  })

  it('keeps the section ids the navigation links to', () => {
    renderHome()
    for (const id of ['feasts', 'coffee', 'visit']) {
      expect(document.getElementById(id)).not.toBeNull()
    }
  })

  it('shows “Serves N” next to each feast price', () => {
    renderHome()
    const feasts = document.getElementById('feasts')
    if (!feasts) throw new Error('no feasts section')
    expect(within(feasts).getByText('Serves 6')).toBeInTheDocument()
    expect(within(feasts).getByText('3 to 4')).toHaveClass('sr-only')
  })
})

describe('MenuPreview', () => {
  it('filters the featured dishes by group and announces the count', () => {
    render(
      <MemoryRouter>
        <MenuPreview />
      </MemoryRouter>,
    )
    const list = () => screen.getAllByRole('listitem')
    expect(list()).toHaveLength(8)
    expect(screen.getByText('Showing 8 dishes')).toBeInTheDocument()

    const desserts = screen.getByRole('button', { name: 'Desserts' })
    fireEvent.click(desserts)
    expect(desserts).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
    expect(list()).toHaveLength(2)
    expect(screen.getByText('Showing 2 dishes')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Molten Lava with Ice Cream' })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'See the full menu' })).toHaveAttribute('href', '/menu')
  })
})

describe('HoursTable', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is a real table with the current day marked', () => {
    render(
      <>
        <h3 id="hours">Opening hours</h3>
        <HoursTable week={cafe.openingHours} currentDay="Monday" labelledBy="hours" />
      </>,
    )
    const table = screen.getByRole('table', { name: 'Opening hours' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(7)
    const monday = within(table).getByRole('rowheader', { name: 'Monday' }).closest('tr')
    expect(monday).toHaveAttribute('aria-current', 'date')
    expect(monday).toHaveTextContent('11 AM to 1 AM')
    expect(rows.filter((row) => row.hasAttribute('aria-current'))).toHaveLength(1)
  })

  it('in the Visit section, marks Monday at 00:30 on Tuesday and says open', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-29T00:30:00+05:00'))
    renderHome()
    const visit = document.getElementById('visit')
    if (!visit) throw new Error('no visit section')
    expect(within(visit).getByRole('status')).toHaveTextContent('Open now until 1 AM')
    const current = visit.querySelector('tr[aria-current="date"]')
    expect(current).toHaveTextContent('Monday')
  })
})
