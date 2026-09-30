import { useEffect, useLayoutEffect, useRef } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'

const STORAGE_KEY = 'eddys:scroll-positions'

function loadPositions(): Map<string, number> {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY)
    return new Map(saved ? (JSON.parse(saved) as [string, number][]) : [])
  } catch {
    return new Map()
  }
}

/**
 * Scroll position on route change: new pages start at the top, back/forward
 * returns to where you were on that page (also after a reload). Query-only
 * updates that replace the entry (menu filters) keep the position. Pages with a
 * #hash are left to ScrollToHash.
 *
 * Positions are recorded while scrolling (passive, once per frame) because by
 * the time a route change renders, a shorter new page may already have
 * clamped the old scroll position.
 */
export function ScrollRestorer() {
  const { key, hash, pathname, search } = useLocation()
  const navigationType = useNavigationType()
  // Every fresh page load has the key "default", so the URL is part of the
  // entry's identity: a new address must not inherit the last page's position.
  const entryKey = `${key} ${pathname}${search}`
  const positions = useRef<Map<string, number> | null>(null)
  const currentKey = useRef(entryKey)
  const currentPath = useRef(pathname)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    positions.current ??= loadPositions()
    let frame = 0

    const record = () => {
      frame = 0
      positions.current?.set(currentKey.current, window.scrollY)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(record)
    }
    const persist = () => {
      try {
        const entries = [...(positions.current ?? new Map<string, number>())].slice(-50)
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      } catch {
        // Storage blocked: positions are kept in memory for this visit only.
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', persist)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', persist)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Layout effect: set the position before the new page is painted.
  useLayoutEffect(() => {
    // Replacing the query string of the same page (menu filters) isn't a page change: stay put.
    const samePage = navigationType === NavigationType.Replace && pathname === currentPath.current
    currentKey.current = entryKey
    currentPath.current = pathname
    positions.current ??= loadPositions()
    if (samePage) {
      positions.current.set(entryKey, window.scrollY)
      return
    }
    const saved = positions.current.get(entryKey)
    if (navigationType === NavigationType.Pop && saved !== undefined) {
      window.scrollTo(0, saved)
    } else if (!hash) {
      window.scrollTo(0, 0)
    }
  }, [entryKey, hash, navigationType, pathname])

  return null
}
