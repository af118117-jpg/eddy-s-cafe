import { Suspense, useRef, useState } from 'react'
import { matchRoutes, Outlet, useLocation, type RouteObject } from 'react-router-dom'
import {
  AnnouncementBar,
  HOME_LINK_ID,
  MAIN_ID,
  MobileActionBar,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from '@/components/layout'
import { pageMeta, type PageMeta } from '@/data/site'
import { useMinWidth, useScrolledPast } from '@/hooks'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { ScrollRestorer } from './ScrollRestorer'
import { ScrollToHash } from './ScrollToHash'
import { useRouteFocus } from './useRouteFocus'

/** Per-route settings, set as `handle` on the page routes. */
export interface RouteHandle {
  /** Title, description and canonical path (src/data/site.ts). */
  meta?: PageMeta
  /** The page starts with a full-bleed hero the header sits over. */
  headerOverlay?: boolean
}

function isRouteHandle(value: unknown): value is RouteHandle {
  return typeof value === 'object' && value !== null
}

function focusHomeLink() {
  document.getElementById(HOME_LINK_ID)?.focus()
}

interface SiteLayoutProps {
  /** The page routes rendered in this frame, used to read the current page's handle. */
  pages: RouteObject[]
}

/** Shared page frame: skip link, announcement, header, main, footer, mobile action bar. */
export function SiteLayout({ pages }: SiteLayoutProps) {
  const location = useLocation()
  const matched: unknown = matchRoutes(pages, location)?.at(-1)?.route.handle
  const handle: RouteHandle = isRouteHandle(matched) ? matched : {}
  const isDesktop = useMinWidth('lg')

  // The nav is open only on the page where it was opened, so any navigation
  // (a link, back/forward) closes it without an effect.
  const [navOpenAt, setNavOpenAt] = useState<string | null>(null)
  const navOpen = !isDesktop && navOpenAt === location.key

  // 24px sentinel at the very top of the page: once it scrolls away, the header turns solid.
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrolled = useScrolledPast(sentinelRef)

  useRouteFocus()

  useDocumentHead(handle.meta ?? pageMeta.notFound)

  return (
    <div className="relative flex min-h-svh flex-col pb-(--action-bar-space)">
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-6"
      />
      <SkipLink />
      <AnnouncementBar onDismiss={focusHomeLink} />
      <SiteHeader
        overlay={handle.headerOverlay === true && !scrolled}
        hideOnScroll={!isDesktop && !navOpen}
        navOpen={navOpen}
        onNavOpen={() => {
          setNavOpenAt(location.key)
        }}
        onNavClose={() => {
          setNavOpenAt(null)
        }}
      />
      <main id={MAIN_ID} tabIndex={-1} className="flex-1">
        {/*
          Already mounted, so a lazy page loading during navigation keeps the old page on screen.
          On a first visit straight to a lazy page, the fallback holds a screen's height, so the
          footer isn't drawn at the top and then pushed away (a layout shift).
        */}
        <Suspense fallback={<div aria-hidden="true" className="min-h-svh" />}>
          <Outlet />
          {/* Inside the boundary: they act in the same commit as the page content, even when a lazy page loads late. */}
          <ScrollRestorer />
          <ScrollToHash />
        </Suspense>
      </main>
      <SiteFooter />
      {!navOpen && <MobileActionBar />}
    </div>
  )
}
