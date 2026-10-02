import { Component, type ReactNode } from 'react'
import { Button, Container } from '@/components/ui'

const RETRY_KEY = 'eddys:reloaded-for'
// A reload that fails again this soon is the same failure: show the message instead of looping.
const RETRY_WINDOW_MS = 10_000

/**
 * The page's code didn't download. After a new deploy the old chunk names are
 * gone, so a tab opened before it can't load the next page until it reloads.
 */
function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /dynamically imported module|module script failed|Loading chunk/i.test(error.message)
  )
}

/**
 * Whether reloading on its own may fix it: not when this address was just
 * reloaded for the same reason, and not when storage is blocked (it couldn't
 * tell, and might reload forever).
 */
function mayRetry(): boolean {
  try {
    const saved = window.sessionStorage.getItem(RETRY_KEY)
    if (!saved) return true
    const last = JSON.parse(saved) as { href: string; at: number }
    return last.href !== window.location.href || Date.now() - last.at > RETRY_WINDOW_MS
  } catch {
    return false
  }
}

function reload() {
  try {
    const retry = { href: window.location.href, at: Date.now() }
    window.sessionStorage.setItem(RETRY_KEY, JSON.stringify(retry))
  } catch {
    // Storage blocked: this was a click on "Reload the page", so reload anyway.
  }
  window.location.reload()
}

interface PageErrorBoundaryProps {
  children: ReactNode
  /** Changing it (the page's path) clears the error, so the nav still works after one. */
  resetKey: string
}

interface PageErrorBoundaryState {
  failed: boolean
  /** Reloading to fetch the new deploy's files: render nothing meanwhile. */
  retrying: boolean
}

/**
 * Catches errors while loading or rendering a page, so the site frame (header,
 * nav, footer) stays usable instead of the whole screen going blank.
 */
export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  override state: PageErrorBoundaryState = { failed: false, retrying: false }

  static getDerivedStateFromError(error: unknown): PageErrorBoundaryState {
    return { failed: true, retrying: isChunkLoadError(error) && mayRetry() }
  }

  override componentDidCatch() {
    if (this.state.retrying) reload()
  }

  override componentDidUpdate(previous: PageErrorBoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false, retrying: false })
    }
  }

  override render() {
    if (!this.state.failed) return this.props.children
    if (this.state.retrying) return null
    return (
      <Container className="flex flex-col items-start gap-8 py-section">
        <h1 className="text-h2">This page didn’t load</h1>
        <p className="prose-width text-body-lg text-ink-muted">
          The connection may have dropped, or the site was just updated. Reloading usually fixes it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reload}>Reload the page</Button>
          <Button href="/" variant="secondary">
            Go to the home page
          </Button>
        </div>
      </Container>
    )
  }
}
