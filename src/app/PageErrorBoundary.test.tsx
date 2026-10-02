import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PageErrorBoundary } from './PageErrorBoundary'

function Throw({ error }: { error: Error }): never {
  throw error
}

// What browsers throw when a lazy page's file is gone (here, after a new deploy).
const chunkError = new TypeError(
  'Failed to fetch dynamically imported module: https://eddys-cafe.example/assets/Menu-abc123.js',
)

// React reports caught errors on window too, which jsdom would print: expected here.
const silence = (event: ErrorEvent) => {
  event.preventDefault()
}

describe('PageErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught errors, and jsdom logs that it can't reload: expected here.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    window.addEventListener('error', silence)
  })
  afterEach(() => {
    window.removeEventListener('error', silence)
    vi.restoreAllMocks()
    window.sessionStorage.clear()
  })

  it('shows a way out instead of a blank page when a page fails', () => {
    render(
      <PageErrorBoundary resetKey="/">
        <Throw error={new Error('boom')} />
      </PageErrorBoundary>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'This page didn’t load' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Reload the page' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/')
  })

  it('reloads once when a page’s code is missing, then shows the message', () => {
    const { unmount } = render(
      <PageErrorBoundary resetKey="/menu">
        <Throw error={chunkError} />
      </PageErrorBoundary>,
    )
    // First failure: reloading (for the new deploy's files), so nothing to read meanwhile.
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(window.sessionStorage.getItem('eddys:reloaded-for')).toContain(window.location.href)
    unmount()

    // The same failure straight after that reload: no loop, the message instead.
    render(
      <PageErrorBoundary resetKey="/menu">
        <Throw error={chunkError} />
      </PageErrorBoundary>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'This page didn’t load' })).toBeVisible()
  })

  it('never reloads on its own when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(
      <PageErrorBoundary resetKey="/menu">
        <Throw error={chunkError} />
      </PageErrorBoundary>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'This page didn’t load' })).toBeVisible()
  })

  it('clears the error when the visitor moves to another page', () => {
    const { rerender } = render(
      <PageErrorBoundary resetKey="/menu">
        <Throw error={new Error('boom')} />
      </PageErrorBoundary>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This page didn’t load')
    rerender(
      <PageErrorBoundary resetKey="/">
        <h1>Home</h1>
      </PageErrorBoundary>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home')
  })
})
