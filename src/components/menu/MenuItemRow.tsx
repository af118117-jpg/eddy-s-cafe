import { Fragment } from 'react'
import { Photo, Price, ServesLabel } from '@/components/ui'
import type { MenuEntry, MenuPrice, MenuTag } from '@/data/menu-sections'
import { cn } from '@/lib/cn'

/** "Rs 1,999", or "Chicken Rs 1,999 / Beef Rs 2,949" (read as a comma-separated list). */
function EntryPrice({ prices }: { prices: readonly MenuPrice[] }) {
  return prices.map((price, index) => (
    <Fragment key={price.label ?? index}>
      {index > 0 && (
        <>
          <span aria-hidden="true"> / </span>
          <span className="sr-only">, </span>
        </>
      )}
      <span className="whitespace-nowrap">
        {price.label && <span className="text-ink-muted">{price.label} </span>}
        <Price amount={price.amount} from={price.from} />
      </span>
    </Fragment>
  ))
}

function TagLabel({ tag }: { tag: MenuTag }) {
  return tag.kind === 'spicy' ? 'Spicy' : <ServesLabel serves={tag.serves} />
}

/**
 * Name, a dotted leader, the price; the description below, then tags.
 * The leader sits on the baseline of the name's last line, however it wraps.
 */
export function MenuItemRow({ entry }: { entry: MenuEntry }) {
  // Two prices are too long to share a narrow line: they may drop below the name, right-aligned.
  const variants = entry.prices.length > 1
  return (
    <li className="flex gap-4">
      {entry.image.src && (
        <Photo image={entry.image} ratio="gallery" sizes="4rem" className="w-16 shrink-0" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className={cn('flex items-baseline-last gap-x-2', variants && 'flex-wrap')}>
          <h3 className="min-w-0 text-item-name text-pretty">{entry.name}</h3>
          <span
            aria-hidden="true"
            className="min-w-6 flex-1 border-b border-dotted border-beige-dark"
          />
          <p
            className={cn(
              'text-right text-body tabular-nums',
              variants ? 'ml-auto' : 'max-w-1/2 shrink-0',
            )}
          >
            <EntryPrice prices={entry.prices} />
          </p>
        </div>
        <p className="text-small text-ink-muted">{entry.description}</p>
        {entry.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <li key={tag.kind} className="border border-line px-2 py-1 text-meta text-ink-muted">
                <TagLabel tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}
