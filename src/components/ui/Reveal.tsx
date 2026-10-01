import { useRef, type ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/cn'

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
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Starts once a tenth of the viewport past the bottom edge, so the wipe is seen.
  const inView = useInView(ref, { rootMargin: '0px 0px -10% 0px' })
  return (
    <div ref={ref} data-reveal={inView ? 'shown' : 'hidden'} className={cn('block', className)}>
      {children}
    </div>
  )
}
