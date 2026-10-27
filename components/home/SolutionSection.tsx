import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

/** "Built by operators, for operators" with a Duffers photo slot. */
export function SolutionSection() {
  return (
    <Section aria-labelledby="solution-heading">
      <div className="grid items-end gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading
            eyebrow="Why ResCommand"
            title={<span id="solution-heading">Built by operators, for operators</span>}
          />
          <p className="max-w-text text-body text-grey">
            ResCommand is built on real restaurant challenges. We started with Duffers Donuts — a
            scratch-made donut shop in Charleston. Every feature comes from &ldquo;we need this to
            survive.&rdquo; It&rsquo;s not feature-bloated enterprise software. It&rsquo;s the exact
            tools a small team actually uses.
          </p>
          <Button href="/about" variant="link">
            Read how Duffers uses ResCommand →
          </Button>
        </div>
        <ImagePlaceholder label="Duffers Donuts operation" ratio="4/3" />
      </div>
    </Section>
  )
}
