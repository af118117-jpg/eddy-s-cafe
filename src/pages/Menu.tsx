import { Container } from '@/components/ui'

/* Placeholder menu page, loaded lazily. The real menu comes in a later phase. */
export default function Menu() {
  return (
    <Container className="flex flex-col gap-6 py-section">
      <h1 className="text-h2">Menu</h1>
      <p className="prose-width text-body-lg text-ink-muted">
        Menu placeholder. The full menu, with search and filters, is built in a later phase.
      </p>
    </Container>
  )
}
