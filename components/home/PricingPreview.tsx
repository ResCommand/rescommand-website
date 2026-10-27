import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PRICING_TIERS } from '@/lib/content'

/** Homepage pricing teaser: two tiers + link to the full pricing page. */
export function PricingPreview() {
  return (
    <Section aria-labelledby="pricing-preview-heading">
      <SectionHeading
        eyebrow="Pricing"
        title={<span id="pricing-preview-heading">Simple, Honest Pricing</span>}
        subtitle="No surprise fees. Pay for what you use."
      />
      <PricingTiers />
      <div className="mt-6">
        <Button href="/pricing" variant="link">
          See full pricing →
        </Button>
      </div>
    </Section>
  )
}

/** The two plans side by side; shared with the pricing page. */
export function PricingTiers() {
  return (
    <div className="mt-14 grid gap-x-16 gap-y-14 md:grid-cols-2 lg:max-w-4xl">
      {PRICING_TIERS.map((tier) => (
        <PricingCard key={tier.name} tier={tier} />
      ))}
    </div>
  )
}
