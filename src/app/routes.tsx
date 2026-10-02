import { lazy, Suspense } from 'react'
import { useRoutes, type RouteObject } from 'react-router-dom'
import { pageMeta } from '@/data/site'
import NotFound from '@/pages/NotFound'
import { lazyPage } from './lazyPage'
import { SiteLayout, type RouteHandle } from './SiteLayout'

// Each page is its own chunk, so a page doesn't download the others' code and
// photos. Each page's HTML file preloads its chunk (vite.config.ts, PAGES:
// keep it in step with these routes).
const Home = lazyPage(() => import('@/pages/Home'))
const Menu = lazy(() => import('@/pages/Menu'))

/**
 * Before the first render, main.tsx waits for the home page's code, so the
 * hero (its largest paint) renders with the site frame instead of one
 * Suspense round later. The menu doesn't wait: its frame paints first, which
 * splits up the work of rendering 180 dishes.
 */
export function preloadPage(pathname: string): Promise<void> {
  return pathname === '/' ? Home.preload() : Promise.resolve()
}

// Dev only: `import.meta.env.DEV` is false in production builds, so this
// import and its chunk are dropped.
const Styleguide = import.meta.env.DEV ? lazy(() => import('@/pages/_Styleguide')) : null

/** Pages inside the site frame. `handle` sets the head (title, description, canonical) and header style. */
const pages: RouteObject[] = [
  {
    index: true,
    element: <Home />, // lazy: SiteLayout wraps pages in Suspense
    handle: { meta: pageMeta.home, headerOverlay: true } satisfies RouteHandle,
  },
  {
    path: 'menu',
    element: <Menu />, // lazy: SiteLayout wraps pages in Suspense
    handle: { meta: pageMeta.menu } satisfies RouteHandle,
  },
  {
    path: '*',
    element: <NotFound />,
    handle: { meta: pageMeta.notFound } satisfies RouteHandle,
  },
]

export const routes: RouteObject[] = [
  { element: <SiteLayout pages={pages} />, children: pages },
  ...(Styleguide
    ? [
        {
          path: 'styleguide',
          element: (
            <Suspense fallback={null}>
              <Styleguide />
            </Suspense>
          ),
        },
      ]
    : []),
]

export function AppRoutes() {
  return useRoutes(routes)
}
