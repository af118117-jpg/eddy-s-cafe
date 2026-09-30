import type { Serves } from '@/data'

/** "Serves 6", or "Serves 3–4" (read as "3 to 4": screen readers say "3 minus 4" for the dash). */
export function ServesLabel({ serves }: { serves: Serves }) {
  if (serves.min === serves.max) return <>Serves {serves.min}</>
  return (
    <>
      Serves <span aria-hidden="true">{`${String(serves.min)}–${String(serves.max)}`}</span>
      <span className="sr-only">{`${String(serves.min)} to ${String(serves.max)}`}</span>
    </>
  )
}
