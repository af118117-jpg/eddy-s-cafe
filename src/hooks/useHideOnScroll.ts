import { useCallback, useEffect, useState, type RefObject } from 'react'

// Ignore scroll jitter smaller than this (CSS px).
const SCROLL_DELTA = 8

/**
 * Hides `element` while the page scrolls down and shows it again on scroll up.
 * Direction needs a scroll listener; it is passive, frame-throttled, and only
 * attached while `enabled`. Call `reveal` to show it on demand (e.g. on focus).
 */
export function useHideOnScroll(
  element: RefObject<HTMLElement | null>,
  enabled: boolean,
): { hidden: boolean; reveal: () => void } {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let lastY = window.scrollY
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < SCROLL_DELTA) return
      const height = element.current?.offsetHeight ?? 0
      // More than a screen in one frame is a jump (an anchor link, a restored
      // position), not reading: show the header, and keep the offsets that
      // anchors are scrolled to (header + sticky bars) accurate.
      const jumped = Math.abs(delta) > window.innerHeight
      setHidden(!jumped && delta > 0 && y > height)
      lastY = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [element, enabled])

  const reveal = useCallback(() => {
    setHidden(false)
  }, [])

  return { hidden: enabled && hidden, reveal }
}
