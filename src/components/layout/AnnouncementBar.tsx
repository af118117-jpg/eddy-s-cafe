import { X } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '@/components/ui'
import { cafe } from '@/data'

const STORAGE_KEY = 'eddys:announcement-dismissed'
// Change this when the message changes, so a new announcement shows again.
const ANNOUNCEMENT_ID = 'open-daily-foodpanda'

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === ANNOUNCEMENT_ID
  } catch {
    return false // Storage blocked (private mode, disabled cookies): show the bar.
  }
}

function saveDismissed(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_ID)
  } catch {
    // Storage blocked: the bar stays dismissed for this visit only.
  }
}

interface AnnouncementBarProps {
  /** Called after dismissing, so focus can move somewhere sensible. */
  onDismiss?: () => void
}

export function AnnouncementBar({ onDismiss }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(readDismissed)
  if (dismissed) return null

  const dismiss = () => {
    saveDismissed()
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <section aria-label="Announcement" data-surface="cream" data-announcement>
      <div className="container-wide flex items-center gap-2">
        {/* Balances the dismiss button so the message sits in the true centre. */}
        <span aria-hidden="true" className="-ml-3 hidden w-control-md shrink-0 sm:block" />
        <p className="flex min-h-control-md flex-1 flex-wrap items-center justify-center gap-x-4 text-center text-small">
          <span>
            Open daily till late<span className="max-sm:hidden"> on Green Avenue</span>
          </span>
          <a
            href={cafe.links.foodpanda}
            className="font-medium underline decoration-beige-dark underline-offset-4 hover:decoration-current"
          >
            Order on foodpanda
          </a>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="-mr-3 inline-flex size-(--spacing-control-md) shrink-0 items-center justify-center rounded-pill transition-colors duration-(--duration-micro) ease-standard hover:bg-fg hover:text-fg-inverse"
        >
          <Icon icon={X} size="sm" />
        </button>
      </div>
    </section>
  )
}
