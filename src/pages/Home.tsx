import { Container, SectionHeading } from '@/components/ui'

/*
 * Placeholder home page. The real sections (Hero, Intro, Signatures, ...) come
 * in the next phase; this keeps the header overlay and the #feasts, #coffee
 * and #visit anchors working in the meantime.
 */

const placeholderSections = [
  { id: 'feasts', title: 'Feasts' },
  { id: 'coffee', title: 'Coffee' },
  { id: 'visit', title: 'Visit' },
] as const

export default function Home() {
  return (
    <>
      {/* Hero stand-in: pulled up under the transparent header. */}
      <section
        data-surface="ink"
        aria-labelledby="home-title"
        className="-mt-(--header-height) flex min-h-svh items-end pt-(--header-height) pb-section"
      >
        <Container size="wide">
          <h1 id="home-title" className="text-h2">
            eddy’s Café
          </h1>
          <p className="mt-4 text-body-lg text-ink-muted">
            Hero placeholder. Built in the next phase.
          </p>
        </Container>
      </section>

      {placeholderSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          className="border-t py-section"
        >
          <Container>
            <SectionHeading
              id={`${section.id}-title`}
              title={section.title}
              intro="Placeholder section. Built in the next phase."
            />
          </Container>
        </section>
      ))}
    </>
  )
}
