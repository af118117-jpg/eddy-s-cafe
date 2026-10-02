import { useEffect } from 'react'
import { siteUrl, type PageMeta } from '@/data/site'

/** Sets a <meta>'s content, adding the tag if it's missing; null removes it. */
function setMeta(attribute: 'name' | 'property', key: string, content: string | null) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (content === null) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.append(tag)
  }
  tag.content = content
}

function setCanonical(href: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (href === null) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.append(link)
  }
  link.href = href
}

/**
 * Keeps the head in step with the page while navigating inside the app: the
 * title, description, canonical URL and link-preview text. Each page's HTML
 * file already carries them for a first visit (vite.config.ts writes them);
 * pages without a path (not found) are marked noindex.
 */
export function useDocumentHead({ title, description, path }: PageMeta) {
  useEffect(() => {
    const url = path === null ? null : `${siteUrl}${path}`
    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', path === null ? 'noindex' : null)
    setCanonical(url)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
  }, [title, description, path])
}
