import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'aria-pressed' | 'children' | 'type'
> {
  /** Selected state, exposed to assistive tech as aria-pressed. */
  pressed: boolean
  children: ReactNode
}

/** A toggle pill for filters. Styling follows aria-pressed, so state and visuals can't drift. */
export function Chip({ pressed, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'inline-flex min-h-control-md items-center gap-2 rounded-pill border border-line px-4 text-nav text-fg',
        'transition-colors duration-(--duration-micro) ease-standard',
        'hover:border-fg',
        'aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-fg-inverse',
        'aria-pressed:hover:border-ink-muted aria-pressed:hover:bg-ink-muted',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
