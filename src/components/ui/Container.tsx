import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export type ContainerSize = 'content' | 'wide' | 'prose'

const sizeClass: Record<ContainerSize, string> = {
  content: 'container', // 1280
  wide: 'container-wide', // 1440
  prose: 'container-prose', // 680 / 68ch
}

interface ContainerProps extends ComponentPropsWithoutRef<'div'> {
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav' | 'article' | 'aside'
  size?: ContainerSize
}

/** Centred page column with the 20 / 32 / 48 side margins. */
export function Container({
  as: Element = 'div',
  size = 'content',
  className,
  ...rest
}: ContainerProps) {
  return <Element className={cn(sizeClass[size], className)} {...rest} />
}
