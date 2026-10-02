import type { MouseEvent } from 'react'
import { buttonClassName } from '@/components/ui'
import { cn } from '@/lib/cn'

export const MAIN_ID = 'main'

/** First focusable element on every page. Hidden until focused. */
export function SkipLink() {
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById(MAIN_ID)
    if (!main) return
    // Move focus (not just scroll) so the next Tab continues inside main,
    // and keep the URL free of a #main fragment.
    event.preventDefault()
    main.focus()
  }

  return (
    <a
      href={`#${MAIN_ID}`}
      onClick={skip}
      className={cn(buttonClassName('primary', 'md'), 'fixed top-2 left-2 z-60 not-focus:sr-only')}
    >
      Skip to content
    </a>
  )
}
