import { Button } from '@/components/ui'

interface EmptyStateProps {
  /** The search that found nothing, as typed. */
  query: string
  /** The group or category being searched, if not the whole menu. */
  scope: string | null
  /** Matches for the same search in the rest of the menu. */
  menuWideCount: number
  onClearSearch: () => void
  onSearchWholeMenu: () => void
}

/** Says what found nothing and offers the way out: widen the search, or clear it. */
export function EmptyState({
  query,
  scope,
  menuWideCount,
  onClearSearch,
  onSearchWholeMenu,
}: EmptyStateProps) {
  const elsewhere = scope !== null && menuWideCount > 0
  return (
    <div className="flex flex-col items-start gap-6 border-t py-16">
      <h2 className="text-h3 text-balance break-words">
        No matches for “{query.trim()}”{scope && ` in ${scope}`}
      </h2>
      <p className="prose-width text-body text-ink-muted">
        {elsewhere
          ? `The rest of the menu has ${String(menuWideCount)} ${menuWideCount === 1 ? 'match' : 'matches'}.`
          : 'Check the spelling, or search for an ingredient such as lamb, prawns or caramel.'}
      </p>
      <div className="flex flex-wrap gap-3">
        {elsewhere && <Button onClick={onSearchWholeMenu}>Search the whole menu</Button>}
        <Button variant={elsewhere ? 'secondary' : 'primary'} onClick={onClearSearch}>
          Clear search
        </Button>
      </div>
    </div>
  )
}
