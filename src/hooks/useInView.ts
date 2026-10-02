import { useEffect, useState, type RefObject } from 'react'

interface InViewOptions {
  /** Grows or shrinks the viewport box, e.g. "0px 0px -10% 0px" to wait until 10% in. */
  rootMargin?: string
  threshold?: number
  /**
   * If the observer hasn't reported at all this long after the page became
   * visible, answer true anyway: a broken observer must never keep content
   * hidden. (It always reports once straight away, in view or not.)
   */
  fallbackMs?: number
}

/**
 * True once the element has entered the viewport, and stays true: the
 * observer disconnects after the first hit. Without IntersectionObserver the
 * answer is always true, so nothing waits for an event that never comes.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = '0px', threshold = 0, fallbackMs }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const element = ref.current
    if (inView || !element) return
    let reported = false
    const observer = new IntersectionObserver(
      (entries) => {
        reported = true
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(element)

    // Hidden tabs don't render, so observers stay quiet there: count from when the page shows.
    let timer = 0
    const arm = () => {
      if (fallbackMs === undefined || document.visibilityState !== 'visible') return
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (!reported) setInView(true)
      }, fallbackMs)
    }
    arm()
    document.addEventListener('visibilitychange', arm)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', arm)
    }
  }, [ref, inView, rootMargin, threshold, fallbackMs])

  return inView
}
