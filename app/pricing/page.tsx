import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CTASection } from '@/components/ui/CTASection'
import { PricingTiers } from '@/components/home/PricingPreview'
import { PricingComparison } from '@/components/pricing/PricingComparison'
import { Accordion } from '@/components/ui/Accordion'
import { FaqJsonLd } from '@/components/seo/JsonLd'
import { PRICING_FAQ } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Pricing that grows with you. No setup fees, no contracts, cancel anytime. Core at $99/mo, Operator at $199/mo. Try ResCommand free for 14 days.',
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <>
      <FaqJsonLd items={PRICING_FAQ} />

      <PageHero
        eyebrow="Pricing"
        title="Pricing That Grows With You"
        subtitle="No setup fees. No contracts. Cancel anytime."
      />

      <Section>
        <div className="-mt-14">
          <PricingTiers />
        </div>
      </Section>

      <Section aria-labelledby="compare-heading">
        <SectionHeading title={<span id="compare-heading">Compare Plans</span>} />
        <div className="mt-12 max-w-3xl">
          <PricingComparison />
        </div>
      </Section>

      <Section aria-labelledby="pricing-faq-heading">
        <SectionHeading
          title={<span id="pricing-faq-heading">Questions?</span>}
          subtitle={
            <>
              Short answers below. Need more detail?{' '}
              <a href="/help" className="text-signal hover:text-signal-hover">
                Visit the Help Center
              </a>
              .
            </>
          }
        />
        <div className="mt-12 max-w-3xl">
          <Accordion items={PRICING_FAQ} />
        </div>
      </Section>

      <CTASection
        title="Start Today. No Credit Card Required."
        copy="Try ResCommand free for 14 days."
        primaryLabel="Start Your Free Trial"
      />
    </>
  )
}
