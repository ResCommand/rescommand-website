import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/SectionHeading'

export default function NotFound() {
  return (
    <section>
      <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-6 py-20">
        <Label>404</Label>
        <h1 className="max-w-4xl text-hero text-balance">We couldn&rsquo;t find that page</h1>
        <p className="max-w-text text-body text-grey">
          The page you&rsquo;re looking for may have moved or never existed. Let&rsquo;s get you
          back on track.
        </p>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
          <Button href="/">Back to home</Button>
          <Button href="/demo" variant="link">
            Book a demo
          </Button>
        </div>
      </Container>
    </section>
  )
}
