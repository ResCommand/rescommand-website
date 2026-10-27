import { Section } from './Section'
import { Button } from './Button'

interface CTASectionProps {
  title: string
  copy?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

/** Closing call to action used at the foot of most pages: huge line, one blue button. */
export function CTASection({
  title,
  copy,
  primaryLabel = 'Book a Demo',
  primaryHref = '/demo',
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <Section>
      <div className="flex flex-col items-start gap-6">
        <h2 className="max-w-4xl text-huge text-balance">{title}</h2>
        {copy && <p className="max-w-text text-body text-grey">{copy}</p>}
        <div className="mt-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
          <Button href={primaryHref}>{primaryLabel}</Button>
          {secondaryLabel && secondaryHref && (
            <Button href={secondaryHref} variant="link">
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </Section>
  )
}
