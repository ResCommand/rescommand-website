import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Label } from '@/components/ui/SectionHeading'
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'
import { DemoForm } from '@/components/demo/DemoForm'
import { CalendlyEmbed } from '@/components/demo/CalendlyEmbed'

export const metadata: Metadata = {
  title: 'Book a Demo',
  description:
    "Book a 20-minute ResCommand demo with our team. No pressure — see whether it's the right fit for your restaurant.",
  alternates: { canonical: '/demo' },
}

export default function DemoPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL
  const walkthroughId = process.env.NEXT_PUBLIC_YOUTUBE_WALKTHROUGH_ID

  return (
    <section className="pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pt-28">
      <Container>
        <div className="mb-14 flex flex-col items-start gap-6">
          <Label>Book a demo</Label>
          <h1 className="max-w-5xl text-hero text-balance">
            Let&rsquo;s See If ResCommand is Right for You
          </h1>
          <p className="max-w-text text-body text-grey">
            Book a 20-minute demo with our team. No pressure.
          </p>
        </div>

        <div className="grid items-start gap-14 border-t border-line pt-12 lg:grid-cols-5 lg:gap-16">
          {/* Booking — 60% */}
          <div className="lg:col-span-3">
            {calendlyUrl ? <CalendlyEmbed url={calendlyUrl} /> : <DemoForm />}
          </div>

          {/* Video intro — 40% */}
          <aside className="flex flex-col gap-5 lg:col-span-2">
            <div>
              <h2 className="text-body font-medium">See It in Action First</h2>
              <p className="mt-1 text-[15px] text-grey">2-minute product walkthrough.</p>
            </div>
            <YouTubeEmbed
              videoId={walkthroughId}
              title="ResCommand product walkthrough"
              caption="Product Demo Video"
            />
            <p className="text-small text-grey">
              Can&rsquo;t watch now? We&rsquo;ll show you everything in the demo.
            </p>
          </aside>
        </div>
      </Container>
    </section>
  )
}
