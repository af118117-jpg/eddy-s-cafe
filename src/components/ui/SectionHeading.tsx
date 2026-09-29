import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  title: ReactNode
  intro?: ReactNode
  /** Heading level. h2 uses the h2 type style, h3 the h3 style. */
  as?: 'h2' | 'h3'
  align?: 'start' | 'center'
  /** Put on the heading so the section can use aria-labelledby. */
  id?: string
  className?: string
}

export function SectionHeading({
  title,
  intro,
  as: Heading = 'h2',
  align = 'start',
  id,
  className,
}: SectionHeadingProps) {
  const isH2 = Heading === 'h2'
  return (
    <div
      className={cn(
        'flex flex-col',
        isH2 ? 'gap-6' : 'gap-3',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <Heading id={id} className={cn(isH2 ? 'text-h2' : 'text-h3', 'text-balance')}>
        {title}
      </Heading>
      {intro !== undefined && (
        <p
          className={cn(
            'prose-width text-pretty text-ink-muted',
            isH2 ? 'text-body-lg' : 'text-body',
          )}
        >
          {intro}
        </p>
      )}
    </div>
  )
}
