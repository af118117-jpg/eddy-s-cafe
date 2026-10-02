import { Button, Photo } from '@/components/ui'
import { cafe, home } from '@/data'

/**
 * Full-height, full-bleed photo with the giant lowercase wordmark cropped by
 * the bottom edge: the page's one bold move.
 *
 * The h1 comes first in the DOM (read first by screen readers) but sits last
 * visually. Ink scrims keep the header, the line and the buttons above AA
 * contrast whatever the photo looks like.
 */
export function Hero() {
  const { positioning, image } = home.hero
  return (
    <section
      data-surface="ink"
      aria-labelledby="hero-title"
      className="relative -mt-(--header-height) flex min-h-[calc(100svh-var(--announcement-height)-var(--action-bar-space))] flex-col justify-end overflow-hidden"
    >
      <Photo image={image} ratio="fill" sizes="100vw" priority className="absolute inset-0" />
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
        eddy’s<span className="sr-only"> Café</span>
      </h1>

      <div className="container-wide relative flex flex-col items-start gap-8 pt-[calc(var(--header-height)+var(--spacing-16))]">
        <p className="prose-width text-body-lg text-balance">{positioning}</p>
        <div className="flex flex-wrap gap-3">
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
