import { Price } from '@/components/ui'
import type { MenuItem } from '@/data'
import { cn } from '@/lib/cn'

interface DishTextProps {
  item: MenuItem
  /** Short line under the name; defaults to the menu description. */
  description?: string
  /** Larger name and price, for a featured dish. */
  large?: boolean
  /** Narrow column beside a thumbnail: the price drops under the name below 768px. */
  compact?: boolean
  className?: string
}

/** Name and price on one line, description below. The name is an h3. */
export function DishText({
  item,
  description,
  large = false,
  compact = false,
  className,
}: DishTextProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className={cn(
          'flex items-baseline justify-between gap-4',
          compact && 'max-md:flex-col max-md:gap-1',
        )}
      >
        <h3 className={large ? 'text-h3' : 'text-item-name'}>{item.name}</h3>
        <Price
          amount={item.price}
          from={item.priceFrom}
          className={cn('shrink-0', large ? 'text-body-lg' : 'text-body')}
        />
      </div>
      <p className={cn('text-ink-muted', large ? 'text-body' : 'text-small')}>
        {description ?? item.description}
      </p>
    </div>
  )
}
