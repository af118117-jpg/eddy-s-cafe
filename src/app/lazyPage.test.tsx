import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { describe, expect, it } from 'vitest'
import { lazyPage } from './lazyPage'

function Ready() {
  return <h1>Page</h1>
}

describe('lazyPage', () => {
  it('renders a preloaded page in the first pass, without the fallback', async () => {
    const Page = lazyPage(() => Promise.resolve({ default: Ready }))
    await Page.preload()
    render(
      <Suspense fallback={<p>Loading</p>}>
        <Page />
      </Suspense>,
    )
    expect(screen.getByRole('heading', { name: 'Page' })).toBeInTheDocument()
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()
  })

  it('suspends like React.lazy when it was not preloaded', async () => {
    const Page = lazyPage(() => Promise.resolve({ default: Ready }))
    render(
      <Suspense fallback={<p>Loading</p>}>
        <Page />
      </Suspense>,
    )
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Page' })).toBeInTheDocument()
  })
})
