import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { PhoneFrame } from '@/components/ui/PhoneFrame'
import { FEATURES } from '@/lib/content'

/** "One App. Everything You Need." — then one screen per feature: huge line, a sentence, the app. */
export function FeaturesGrid() {
  return (
    <>
      <Section aria-labelledby="features-heading">
        <SectionHeading
          eyebrow="The solution"
          title={<span id="features-heading">One App. Everything You Need.</span>}
          subtitle="No more scattered tools. No more chaos."
        />
      </Section>

      {FEATURES.map(({ title, short, slug, screen }) => (
        <Section key={slug} aria-labelledby={`feature-${slug}`}>
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
            <div className="flex flex-col items-start gap-5">
              <h3 id={`feature-${slug}`} className="text-huge text-balance">
                {title}
              </h3>
              <p className="max-w-text text-body text-grey">{short}</p>
              <Button href={`/features#${slug}`} variant="link">
                Learn more →
              </Button>
            </div>
            <PhoneFrame screen={screen} />
          </div>
        </Section>
      ))}

      <Section>
        <Button href="/features" variant="link">
          Explore all features →
        </Button>
      </Section>
    </>
  )
}
