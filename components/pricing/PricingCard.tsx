import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/SectionHeading'
import type { PricingTier } from '@/lib/content'

interface PricingCardProps {
  tier: PricingTier
  ctaHref?: string
}

/**
 * One plan in plain ink: the price is the huge line, features sit on hairline
 * rows. Only the featured tier gets the filled blue button.
 */
export function PricingCard({ tier, ctaHref = '/demo' }: PricingCardProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-3">
        <h3 className="text-body font-medium">{tier.name}</h3>
        {tier.featured && <Label>Most popular</Label>}
      </div>

      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-huge">{tier.price}</span>
        <span className="text-small text-grey">{tier.cadence}</span>
      </p>
      <p className="mt-3 text-[15px] text-grey">{tier.blurb}</p>

      <ul className="mt-6 border-b border-line">
        {tier.highlights.map((item) => (
          <li key={item} className="flex min-h-[48px] items-center border-t border-line text-[15px]">
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button href={ctaHref} variant={tier.featured ? 'primary' : 'link'}>
          {tier.cta}
          {!tier.featured && ' →'}
        </Button>
      </div>
    </div>
  )
}
