import { lazy, Suspense } from 'react'
import { useRoutes, type RouteObject } from 'react-router-dom'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { SiteLayout, type RouteHandle } from './SiteLayout'

const Menu = lazy(() => import('@/pages/Menu'))

// Dev only: `import.meta.env.DEV` is false in production builds, so this
// import and its chunk are dropped.
const Styleguide = import.meta.env.DEV ? lazy(() => import('@/pages/_Styleguide')) : null

/** Pages inside the site frame. `handle` sets the title and header style. */
const pages: RouteObject[] = [
  {
    index: true,
    element: <Home />,
    handle: { headerOverlay: true } satisfies RouteHandle,
  },
  {
    path: 'menu',
    element: <Menu />, // lazy: SiteLayout wraps pages in Suspense
    handle: { title: 'Menu' } satisfies RouteHandle,
  },
  {
    path: '*',
    element: <NotFound />,
    handle: { title: 'Page not found' } satisfies RouteHandle,
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
