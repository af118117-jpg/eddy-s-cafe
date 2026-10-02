import { cn } from '@/lib/cn'

/** The lowercase text wordmark. Decorative; the surrounding link or heading carries the name. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('lowercase', className)}>
      eddy’s
    </span>
  )
}
