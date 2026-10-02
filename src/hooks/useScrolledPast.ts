import { useEffect, useState, type RefObject } from 'react'

/**
 * True once `sentinel` has scrolled out of view. Uses an IntersectionObserver
 * instead of a scroll listener.
 */
export function useScrolledPast(sentinel: RefObject<HTMLElement | null>): boolean {
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    const element = sentinel.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setScrolledPast(!entry.isIntersecting)
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [sentinel])

  return scrolledPast
}
