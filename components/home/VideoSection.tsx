import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'

/** "See ResCommand in Action" — demo video, or a labeled empty frame until one is set. */
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
        <YouTubeEmbed videoId={videoId} title="ResCommand product demo" caption="Watch the 2-minute demo" />
      </div>
    </Section>
  )
}
