import type { LucideIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'link'
export type ButtonSize = 'md' | 'lg'

interface ButtonOwnProps {
  /** primary: ink pill. secondary: ink outline pill. link: underlined text. */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Only when the icon adds meaning (e.g. a phone for "Call"). Hidden from screen readers. */
  icon?: LucideIcon
  iconPosition?: 'start' | 'end'
  children: ReactNode
  className?: string
}

type NativeButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonOwnProps> & { href?: never; to?: never }

/** Plain <a>: external links, tel:, anchors on the same page. */
type AnchorProps = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof ButtonOwnProps | 'href'> & { href: string; to?: never }

/** Client-side route change; renders an <a>. */
type RouteLinkProps = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof ButtonOwnProps | 'href'> & { to: string; href?: never }

export type ButtonProps = NativeButtonProps | AnchorProps | RouteLinkProps

const base =
  'inline-flex items-center justify-center gap-2 text-center font-medium transition-colors duration-(--duration-micro) ease-standard ' +
  'disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40'

// fg / fg-inverse swap on ink surfaces, so every variant inverts there automatically.
const variantClass: Record<ButtonVariant, string> = {
  primary: 'rounded-pill bg-fg text-fg-inverse hover:bg-ink-muted',
  secondary: 'rounded-pill border border-fg text-fg hover:bg-fg hover:text-fg-inverse',
  link: 'underline decoration-beige-dark decoration-1 underline-offset-4 hover:decoration-current',
}

const sizeClass: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { md: 'min-h-control-md px-6 text-nav', lg: 'min-h-control-lg px-8 text-body' },
  secondary: { md: 'min-h-control-md px-6 text-nav', lg: 'min-h-control-lg px-8 text-body' },
  link: { md: 'min-h-control-md text-nav', lg: 'min-h-control-lg text-body' },
}

export function buttonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(base, variantClass[variant], sizeClass[variant][size], className)
}

/**
 * Renders a <button> by default, an <a> when given `href`, or a router <Link> when given `to`.
 * Always at least 44px tall.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'end',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = buttonClassName(variant, size, className)
  const iconElement = icon ? <Icon icon={icon} size={size === 'lg' ? 'md' : 'sm'} /> : null
  const content = (
    <>
      {iconPosition === 'start' && iconElement}
      {children}
      {iconPosition === 'end' && iconElement}
    </>
  )

  if (rest.to !== undefined) {
    const linkProps = rest as Omit<RouteLinkProps, keyof ButtonOwnProps>
    return (
      <Link {...linkProps} className={classes}>
        {content}
      </Link>
    )
  }

  if (rest.href !== undefined) {
    const anchorProps = rest as Omit<AnchorProps, keyof ButtonOwnProps>
    return (
      <a {...anchorProps} className={classes}>
        {content}
      </a>
    )
  }

  const buttonProps = rest as Omit<NativeButtonProps, keyof ButtonOwnProps>
  return (
    <button type="button" {...buttonProps} className={classes}>
      {content}
    </button>
  )
}
