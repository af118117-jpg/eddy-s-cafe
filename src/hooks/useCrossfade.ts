import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react'
import { durationToken, easingToken, motionEnabled } from '@/lib/motion'

// Longest the view stays frozen waiting for React, in case an update renders nothing new.
const MAX_WAIT_MS = 400

/**
 * Crossfades a React state change (200ms, --duration-crossfade).
 *
 * With the View Transitions API the browser freezes the old view, `update`
 * runs, and the new view fades in once React has committed it, which is when
 * `commitKey` changes. Without it, `fallback` fades in after the change. With
 * reduced motion the change is simply instant.
 *
 * Returns `run(update)`. Callers should skip updates that change nothing.
 */
export function useCrossfade(
  commitKey: string,
  fallback: RefObject<HTMLElement>,
): (update: () => void) => void {
  const finishCommit = useRef<(() => void) | null>(null)
  const fadeOnCommit = useRef(false)

  useLayoutEffect(() => {
    finishCommit.current?.()
    finishCommit.current = null
    if (!fadeOnCommit.current) return
    fadeOnCommit.current = false
    const element = fallback.current
    // Very old browsers lack the Web Animations API too: then the change is just instant.
    if (typeof element?.animate !== 'function') return
    element.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: durationToken('--duration-crossfade'),
      easing: easingToken(),
    })
  }, [commitKey, fallback])

  return useCallback((update: () => void) => {
    if (!motionEnabled()) {
      update()
      return
    }
    if (!('startViewTransition' in document)) {
      fadeOnCommit.current = true
      update()
      return
    }
    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          finishCommit.current = resolve
          update()
          window.setTimeout(resolve, MAX_WAIT_MS)
        }),
    )
    // A newer transition skips this one: expected, not an error.
    transition.ready.catch(() => undefined)
  }, [])
}
