import { cn } from '@/lib/cn'
import { formatRupeeAmount } from '@/lib/format'

interface PriceProps {
  /** Whole rupees. */
  amount: number
  /** Prefix with "from" for items with several sizes or options. */
  from?: boolean
  className?: string
}

/** "Rs 1,999" with tabular figures so prices line up in columns. Read aloud as "Rupees 1,999". */
export function Price({ amount, from = false, className }: PriceProps) {
  return (
    <span className={cn('whitespace-nowrap tabular-nums', className)}>
      {from && 'from '}
      <span aria-hidden="true">Rs</span>
      <span className="sr-only">Rupees</span>
      {' '}
      {formatRupeeAmount(amount)}
    </span>
  )
}
