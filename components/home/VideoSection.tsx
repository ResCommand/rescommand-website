import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { DemoVideo } from '@/components/ui/DemoVideo'

/** "See ResCommand in Action" — YouTube when an id is set, otherwise the self-hosted demo. */
export function VideoSection() {
  const videoId = process.env.NEXT_PUBLIC_YOUTUBE_DEMO_ID

  return (
    <Section aria-labelledby="video-heading">
      <SectionHeading
        eyebrow="See it in action"
        title={<span id="video-heading">See ResCommand in Action</span>}
        subtitle="This is what your daily reality looks like."
      />
      <div className="mt-12 max-w-4xl">
        <DemoVideo videoId={videoId} title="ResCommand product demo" caption="Watch the 2-minute demo" />
      </div>
    </Section>
  )
}
