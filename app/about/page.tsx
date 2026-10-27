import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CTASection } from '@/components/ui/CTASection'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

export const metadata: Metadata = {
  title: 'About',
  description:
    'ResCommand came from real restaurant chaos at Duffers Donuts in Charleston. Built by operators, for operators — simple, priced for reality, and built to last.',
  alternates: { canonical: '/about' },
}

const STATS = [
  { value: '1', label: 'donut shop' },
  { value: '4+', label: 'operations challenges solved' },
  { value: '0', label: 'enterprise bloat' },
  { value: '∞', label: 'sanity preserved' },
]

const PHILOSOPHY = [
  {
    title: 'Simple Doesn’t Mean Stupid',
    copy: 'Small restaurants have the same compliance and operational rigor as big chains. We just don’t have the staff to run five different tools. Everything in ResCommand is built for focus: do one thing, do it right.',
  },
  {
    title: 'Priced for Reality',
    copy: 'Enterprise software costs enterprise money. We price for a team of 5–50, not 500. You should never need a payment plan to manage your restaurant better.',
  },
  {
    title: 'Built to Last',
    copy: 'We don’t chase hype features. We improve what matters: reliability, speed, and supporting the way you actually work.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built by Operators, for Operators"
        subtitle="ResCommand came from real restaurant chaos."
      />

      {/* Origin story */}
      <Section aria-labelledby="origin-heading">
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-5">
            <h2 id="origin-heading" className="mb-3 text-huge text-balance">
              The Origin Story
            </h2>
            <p className="max-w-text text-body text-grey">
              ResCommand wasn&rsquo;t born from a boardroom. It came from Duffers Donuts — a
              scratch-made donut shop in Charleston, South Carolina.
            </p>
            <p className="max-w-text text-body text-grey">
              Catherine Williamson, our head baker, was juggling recipes in notebooks. The team was
              scattered across text messages. Prep schedules were printed yesterday, now outdated. We
              watched the chaos and decided: there has to be a better way.
            </p>
            <p className="max-w-text text-body text-grey">
              We built ResCommand as the operating system our restaurant needed. Every feature
              answered a real question: &ldquo;How do we stop the bleeding here?&rdquo; Not features
              we thought restaurants should want. Features restaurants are already trying to use in
              ten different tools.
            </p>

            <dl className="mt-6 max-w-text border-b border-line">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex min-h-[48px] items-center justify-between gap-4 border-t border-line text-[15px]">
                  <dd className="order-2 text-grey">{stat.label}</dd>
                  <dt className="order-1 font-medium">{stat.value}</dt>
                </div>
              ))}
            </dl>
          </div>
          <ImagePlaceholder label="Duffers Donuts kitchen / team" ratio="4/5" />
        </div>
      </Section>

      {/* Philosophy */}
      <Section aria-labelledby="philosophy-heading">
        <SectionHeading title={<span id="philosophy-heading">Why We Do This</span>} />
        <div className="mt-14 grid gap-x-10 md:grid-cols-3">
          {PHILOSOPHY.map((item) => (
            <div key={item.title} className="flex flex-col gap-2 border-t border-line py-6">
              <h3 className="text-body font-medium">{item.title}</h3>
              <p className="text-[15px] text-grey">{item.copy}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Team placeholder */}
      <Section aria-labelledby="team-heading">
        <SectionHeading
          title={<span id="team-heading">The Team</span>}
          subtitle="Operators, builders, and a few very serious donut tasters. Full team bios coming soon."
        />
      </Section>

      <CTASection title="Ready to Stop the Chaos?" />
    </>
  )
}
