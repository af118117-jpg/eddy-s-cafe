import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './routes'

function renderAt(path = '/') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('Site frame', () => {
  it('starts with the skip link and exposes the landmarks', async () => {
    renderAt('/')
    await screen.findByRole('main')
    const focusable = document.querySelectorAll('a[href], button')
    expect(focusable[0]).toHaveTextContent('Skip to content')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Explore' })).toBeInTheDocument()
  })

  it('skip link moves focus to main', async () => {
    renderAt('/')
    const main = await screen.findByRole('main')
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }))
    expect(main).toHaveFocus()
  })

  it('marks the menu link as the current page on /menu', async () => {
    renderAt('/menu')
    await screen.findByRole('heading', { level: 1, name: 'Menu' })
    const header = screen.getByRole('banner')
    expect(within(header).getByRole('link', { name: 'Menu' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(header).getByRole('link', { name: 'Visit' })).not.toHaveAttribute('aria-current')
  })
})

describe('AnnouncementBar', () => {
  it('stays dismissed after a reload', async () => {
    renderAt('/')
    fireEvent.click(await screen.findByRole('button', { name: 'Dismiss announcement' }))
    expect(screen.queryByRole('region', { name: 'Announcement' })).not.toBeInTheDocument()
    expect(document.getElementById('home-link')).toHaveFocus()

    cleanup()
    renderAt('/')
    await screen.findByRole('main')
    expect(screen.queryByRole('region', { name: 'Announcement' })).not.toBeInTheDocument()
  })

  it('still works when storage is blocked', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    renderAt('/')
    fireEvent.click(await screen.findByRole('button', { name: 'Dismiss announcement' }))
    expect(screen.queryByRole('region', { name: 'Announcement' })).not.toBeInTheDocument()
    getItem.mockRestore()
    setItem.mockRestore()
  })
})

describe('MobileNav', () => {
  it('opens a dialog, traps focus, and returns focus to the trigger on Esc', async () => {
    renderAt('/')
    const trigger = await screen.findByRole('button', { name: 'Navigation' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById(trigger.getAttribute('aria-controls') ?? '')).not.toBeNull()

    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Navigation' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const close = within(dialog).getByRole('button', { name: 'Close navigation' })
    expect(close).toHaveFocus()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(screen.queryByRole('navigation', { name: 'Quick actions' })).not.toBeInTheDocument()

    // Tab wraps: last → first, and Shift+Tab: first → last.
    const focusable = [...dialog.querySelectorAll<HTMLElement>('a[href], button')]
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) throw new Error('dialog has no focusable elements')
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('closes when a link is followed', async () => {
    renderAt('/')
    fireEvent.click(await screen.findByRole('button', { name: 'Navigation' }))
    const dialog = screen.getByRole('dialog', { name: 'Navigation' })
    fireEvent.click(within(dialog).getByRole('link', { name: 'Menu' }))
    await screen.findByRole('heading', { level: 1, name: 'Menu' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
