import { useEffect, useState, type RefObject } from 'react'

interface InViewOptions {
  /** Grows or shrinks the viewport box, e.g. "0px 0px -10% 0px" to wait until 10% in. */
  rootMargin?: string
  threshold?: number
}

/**
 * True once the element has entered the viewport, and stays true: the
 * observer disconnects after the first hit. Without IntersectionObserver the
 * answer is always true, so nothing waits for an event that never comes.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = '0px', threshold = 0 }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const element = ref.current
    if (inView || !element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [ref, inView, rootMargin, threshold])

  return inView
}
