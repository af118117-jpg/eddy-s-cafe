/*
 * What search engines and link previews see: the site's address and each
 * page's title and description. The build (vite.config.ts) writes these into
 * each page's HTML file, and useDocumentHead keeps the head in step while
 * navigating inside the app. The Vite config loads this file: relative
 * imports with their extensions only.
 */
import { dailyOpening } from '../lib/hours.ts'
import { cafe } from './cafe.ts'

// Address and hours come from cafe.ts, so the search snippet can't go stale.
const opening = dailyOpening(cafe.openingHours)
const homeDescription = [
  `All-day café and grill at ${cafe.address.street}, ${cafe.address.city}: Middle Eastern charcoal grills, steaks, pizza and specialty coffee.`,
  opening && `Open daily from ${opening}.`,
]
  .filter(Boolean)
  .join(' ')

/**
 * TODO(domain): the café has no website yet, so this is a placeholder on a
 * reserved domain. Set the real address before launch, here and in
 * public/robots.txt and public/sitemap.xml (a test checks that all three agree).
 */
export const siteUrl = 'https://eddys-cafe.example'

export interface PageMeta {
  /** The whole <title>, as search results show it. */
  title: string
  /** About 150 characters: the snippet under the title in search results. */
  description: string
  /** Path of the canonical URL; null for pages that shouldn't be indexed. */
  path: string | null
}

export const pageMeta = {
  home: {
    title: 'eddy’s Café, Faisalabad',
    description: homeDescription,
    path: '/',
  },
  menu: {
    title: 'Menu | eddy’s Café',
    description:
      'The full eddy’s Café menu with prices: Middle Eastern starters and grills, steaks, sharing platters, pizza, pasta, burgers, desserts, coffee and cold drinks.',
    path: '/menu',
  },
  notFound: {
    title: 'Page not found | eddy’s Café',
    description: 'This page doesn’t exist. See the menu, or find eddy’s Café on Green Avenue West.',
    path: null,
  },
} as const satisfies Record<string, PageMeta>

/** The link-preview image (public/og-image.jpg, made by `npm run og-image`). */
export const ogImage = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'The eddy’s wordmark on dark ink: an all-day café and grill on Green Avenue West, Faisalabad',
} as const
