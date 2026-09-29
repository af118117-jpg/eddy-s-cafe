import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type IconSize = 'sm' | 'md' | 'lg'

const sizeClass: Record<IconSize, string> = {
  sm: 'size-(--icon-sm)',
  md: 'size-(--icon-md)',
  lg: 'size-(--icon-lg)',
}

interface IconProps {
  icon: LucideIcon
  /** 16 / 20 / 24px. */
  size?: IconSize
  /** Give a label only when the icon stands alone and carries meaning; otherwise it is hidden from screen readers. */
  label?: string
  className?: string
}

/** A lucide icon at a token size with the token stroke width (1.5). */
export function Icon({ icon: LucideComponent, size = 'md', label, className }: IconProps) {
  return (
    <LucideComponent
      className={cn('shrink-0 stroke-(length:--icon-stroke)', sizeClass[size], className)}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  )
}
