import { useRef, type ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/cn'
import { RevealLoadContext } from './revealLoad'

// An observer that hasn't reported by now is broken: show the photo rather than keep it hidden.
const OBSERVER_FALLBACK_MS = 1500

interface RevealProps {
  children: ReactNode
  /** Layout classes for the wrapper (it replaces the child's place in the layout). */
  className?: string
}

/**
 * Wipes its content in from the bottom (clip-path, 800ms) the first time it
 * scrolls into view. For photos only: Signatures, SpaceFeature and Gallery.
 * Text is never revealed on scroll. The hidden state exists only under
 * html.js-motion, so without JavaScript or with reduced motion it is simply visible.
 *
 * While hidden, the clip-path makes the photo count as out of view, so the
 * browser's lazy loading would only start once the wipe had begun, leaving
 * an empty frame to wipe in. So the photo is told to load a screen ahead
 * (RevealLoadContext) and is ready by the time it is revealed.
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Starts once a tenth of the viewport past the bottom edge, so the wipe is seen.
  const inView = useInView(ref, {
    rootMargin: '0px 0px -10% 0px',
    fallbackMs: OBSERVER_FALLBACK_MS,
  })
  const near = useInView(ref, { rootMargin: '100% 0px', fallbackMs: OBSERVER_FALLBACK_MS })
  return (
    <RevealLoadContext.Provider value={near || inView}>
      <div ref={ref} data-reveal={inView ? 'shown' : 'hidden'} className={cn('block', className)}>
        {children}
      </div>
    </RevealLoadContext.Provider>
  )
}
