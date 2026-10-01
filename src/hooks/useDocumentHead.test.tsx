import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { pageMeta, siteUrl } from '@/data/site'
import { useDocumentHead } from './useDocumentHead'

const content = (selector: string) =>
  document.head.querySelector<HTMLMetaElement>(selector)?.getAttribute('content') ?? null

describe('useDocumentHead', () => {
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('sets the title, description, canonical URL and link-preview text', () => {
    renderHook(() => {
      useDocumentHead(pageMeta.menu)
    })
    expect(document.title).toBe(pageMeta.menu.title)
    expect(content('meta[name="description"]')).toBe(pageMeta.menu.description)
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${siteUrl}/menu`,
    )
    expect(content('meta[property="og:title"]')).toBe(pageMeta.menu.title)
    expect(content('meta[property="og:url"]')).toBe(`${siteUrl}/menu`)
    expect(content('meta[name="twitter:description"]')).toBe(pageMeta.menu.description)
    expect(content('meta[name="robots"]')).toBeNull()
  })

  it('updates the same tags when the page changes, and marks a missing page noindex', () => {
    const { rerender } = renderHook(
      ({ meta }) => {
        useDocumentHead(meta)
      },
      { initialProps: { meta: pageMeta.home as (typeof pageMeta)[keyof typeof pageMeta] } },
    )
    rerender({ meta: pageMeta.notFound })
    expect(document.title).toBe(pageMeta.notFound.title)
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(content('meta[name="robots"]')).toBe('noindex')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(content('meta[property="og:url"]')).toBeNull()

    rerender({ meta: pageMeta.home })
    expect(content('meta[name="robots"]')).toBeNull()
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${siteUrl}/`,
    )
  })
})
