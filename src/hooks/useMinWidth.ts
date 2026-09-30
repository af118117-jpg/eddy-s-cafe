import { useSyncExternalStore } from 'react'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const queries = new Map<Breakpoint, MediaQueryList>()

/** Reads the breakpoint from tokens.css, so JS and CSS can't disagree. */
function mediaQuery(breakpoint: Breakpoint): MediaQueryList | null {
  const cached = queries.get(breakpoint)
  if (cached) return cached
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  const width = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${breakpoint}`)
    .trim()
  if (!width) return null
  const query = window.matchMedia(`(width >= ${width})`)
  queries.set(breakpoint, query)
  return query
}

/** True when the viewport is at least the given breakpoint wide (same as Tailwind's `lg:` etc.). */
export function useMinWidth(breakpoint: Breakpoint): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = mediaQuery(breakpoint)
      query?.addEventListener('change', onChange)
      return () => query?.removeEventListener('change', onChange)
    },
    () => mediaQuery(breakpoint)?.matches ?? false,
  )
}
