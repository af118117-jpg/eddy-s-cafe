import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Keep looking for the target for about a second, for content that renders late.
const MAX_FRAMES = 60

/**
 * Makes links like /#visit work from any page: scrolls the target into view
 * (below the sticky header, via scroll-padding-top) and moves keyboard focus
 * to it, so the next Tab continues from that section.
 */
export function ScrollToHash() {
  const { hash, key } = useLocation()

  useEffect(() => {
    if (!hash) return
    let id: string
    try {
      id = decodeURIComponent(hash.slice(1))
    } catch {
      return // A malformed escape (a mangled link, "#%"): no element can have that id.
    }
    let frame = 0
    let attempts = 0

    const tryScroll = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView()
        if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) {
          target.setAttribute('tabindex', '-1')
        }
        target.focus({ preventScroll: true })
        return
      }
      attempts += 1
      if (attempts < MAX_FRAMES) frame = requestAnimationFrame(tryScroll)
    }

    tryScroll()
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [hash, key])

  return null
}
