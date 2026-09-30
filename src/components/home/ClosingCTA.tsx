import { home } from '@/data'
import { ContactActions } from './ContactActions'

/** One large line, then the ways to get in touch. */
export function ClosingCTA() {
  return (
    <section aria-labelledby="closing-title" className="border-t py-section">
      <div className="container flex flex-col items-start gap-12">
        <h2 id="closing-title" className="max-w-(--container-content) text-h2 text-balance">
          {home.closing.line}
        </h2>
        <ContactActions />
      </div>
    </section>
  )
}
