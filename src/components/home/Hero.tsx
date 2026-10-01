import { useEffect, useState, type CSSProperties } from 'react'
import { Button, Photo } from '@/components/ui'
import { cafe, home } from '@/data'
import { heroImage } from '@/lib/heroImage'

// The wordmark's lines. One today; each further line rises 80ms after the one above.
const WORDMARK_LINES = ['eddy’s'] as const

// The entrance plays on the first visit to the home page in a page load, not on every return to it.
let entrancePlayed = false

/**
 * Full-height, full-bleed photo with the giant lowercase wordmark cropped by
 * the bottom edge: the page's one bold move.
 *
 * The h1 comes first in the DOM (read first by screen readers) but sits last
 * visually. Ink scrims keep the header, the line and the buttons above AA
 * contrast whatever the photo looks like.
 *
 * Entrance (base.css, only under html.js-motion): the photo settles, the
 * wordmark rises out of its line mask, then the line and the buttons fade in.
 */
export function Hero() {
  const { positioning, image } = home.hero
  const [entrance] = useState(() => !entrancePlayed)
  useEffect(() => {
    entrancePlayed = true
  }, [])
  const step = (name: string) => (entrance ? name : undefined)

  return (
    <section
      data-surface="ink"
      aria-labelledby="hero-title"
      className="relative -mt-(--header-height) flex min-h-[calc(100svh-var(--announcement-height)-var(--action-bar-space))] flex-col justify-end overflow-hidden"
    >
      <div data-entrance={step('photo')} className="absolute inset-0">
        <Photo
          image={image}
          ratio="fill"
          sizes={heroImage.narrowSizes}
          artSizes={heroImage.wideSizes}
          priority
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-ink/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink/90 via-ink/70 to-transparent"
      />

      <h1
        id="hero-title"
        className="container-wide relative order-last mt-8 text-display translate-y-[0.16em]"
      >
        {WORDMARK_LINES.map((line, index) => (
          // The mask: each line rises from below its own box, which clips it.
          <span key={line} className="block overflow-hidden">
            <span
              data-entrance={step('line')}
              // The line's place in the stagger (base.css multiplies it by --motion-stagger).
              style={{ '--entrance-line': index } as CSSProperties}
              className="block"
            >
              {line}
            </span>
          </span>
        ))}
        <span className="sr-only"> Café</span>
      </h1>

      <div className="container-wide relative flex flex-col items-start gap-8 pt-[calc(var(--header-height)+var(--spacing-16))]">
        <p data-entrance={step('statement')} className="prose-width text-body-lg text-balance">
          {positioning}
        </p>
        <div data-entrance={step('actions')} className="flex flex-wrap gap-3">
          <Button to="/menu" size="lg">
            View menu
          </Button>
          <Button href={cafe.links.directions} variant="secondary" size="lg">
            Get directions
          </Button>
        </div>
      </div>
    </section>
  )
}
