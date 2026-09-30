import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ChipVariant = 'outline' | 'quiet'

interface ChipProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'aria-pressed' | 'children' | 'type'
> {
  /** Selected state, exposed to assistive tech as aria-pressed. */
  pressed: boolean
  /**
   * outline: bordered pill, filled when pressed (primary filters).
   * quiet: text only, outlined when pressed (a second, subordinate row).
   */
  variant?: ChipVariant
  children: ReactNode
}

const variantClass: Record<ChipVariant, string> = {
  outline: cn(
    'border-line px-4 text-fg hover:border-fg',
    'aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-fg-inverse',
    'aria-pressed:hover:border-ink-muted aria-pressed:hover:bg-ink-muted',
  ),
  // The border is always there (transparent), so pressing doesn't change the size.
  quiet: cn(
    'border-transparent px-3 text-ink-muted hover:text-fg',
    'aria-pressed:border-fg aria-pressed:text-fg',
  ),
}

/** A toggle pill for filters. Styling follows aria-pressed, so state and visuals can't drift. */
export function Chip({ pressed, variant = 'outline', className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'inline-flex min-h-control-md shrink-0 items-center gap-2 rounded-pill border text-nav whitespace-nowrap',
        'transition-colors duration-(--duration-micro) ease-standard',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
