import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the home page inside the site frame', async () => {
    render(<App />)
    // Role queries walk the whole accessibility tree; the full home page needs more than the 1s default.
    const heading = await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })
    expect(heading).toHaveTextContent('eddy’s Café')
    expect(document.querySelector('header')).toBeInTheDocument()
    expect(document.querySelector('main#main')).toBeInTheDocument()
    expect(document.querySelector('footer')).toBeInTheDocument()
  })
})
