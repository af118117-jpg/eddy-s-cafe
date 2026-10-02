import { Button, Container } from '@/components/ui'

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-8 py-section">
      <h1 className="text-h2">Page not found</h1>
      <p className="prose-width text-body-lg text-ink-muted">
        This page doesn’t exist. It may have moved, or the link may be mistyped.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button to="/">Go to the home page</Button>
        <Button to="/menu" variant="secondary">
          See the menu
        </Button>
      </div>
    </Container>
  )
}
