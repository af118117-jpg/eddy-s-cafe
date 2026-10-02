import { useEffect, useLayoutEffect, useRef } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'

const STORAGE_KEY = 'eddys:scroll-positions'
// Keep trying to reach a saved position for about a second.
const MAX_FRAMES = 60
// Any of these means the reader is moving the page themselves: stop restoring.
const INPUT_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

/**
 * Scrolls to `y`. The page may still be too short to get there (the menu
 * renders its later sections just after its first paint), so this keeps
 * trying each frame until it arrives, gives up, or the reader takes over.
 * Returns a cleanup that stops it.
 */
function restore(y: number): () => void {
  let frame = 0
  let frames = 0
  const stop = () => {
    cancelAnimationFrame(frame)
    for (const type of INPUT_EVENTS) window.removeEventListener(type, stop)
  }
  const attempt = () => {
    window.scrollTo(0, y)
    frames += 1
    if (Math.abs(window.scrollY - y) < 1 || frames >= MAX_FRAMES) stop()
    else frame = requestAnimationFrame(attempt)
  }
  for (const type of INPUT_EVENTS) window.addEventListener(type, stop, { passive: true })
  attempt()
  return stop
}

/**
 * Whether this document came from a reload or Back/Forward, the only loads
 * that should land where the reader was. A link from another site or a typed
 * address is a fresh visit, though the tab's saved positions say otherwise.
 */
function documentFromHistory(): boolean {
  if (typeof performance.getEntriesByType !== 'function') return true
  const [load] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  return load?.type !== 'navigate'
}

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
  // The entry the document loaded with, until the reader moves on from it.
  const firstEntry = useRef<string | null>(entryKey)

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
    if (entryKey !== firstEntry.current) firstEntry.current = null
    const freshVisit = firstEntry.current !== null && !documentFromHistory()
    const saved = positions.current.get(entryKey)
    if (navigationType === NavigationType.Pop && saved !== undefined && !freshVisit) {
      return restore(saved)
    } else if (!hash) {
      window.scrollTo(0, 0)
    }
  }, [entryKey, hash, navigationType, pathname])

  return null
}
