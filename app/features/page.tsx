import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Section } from '@/components/ui/Section'
import { CTASection } from '@/components/ui/CTASection'
import { FeatureDetail } from '@/components/features/FeatureDetail'
import { FEATURES } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Scheduling, inventory & par, recipes & prep, and compliance — every ResCommand feature was designed by restaurant operators for restaurant operators.',
  alternates: { canonical: '/features' },
}

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Built for the Chaos You Know"
        subtitle="Every feature designed by restaurant operators for restaurant operators."
      />

      {FEATURES.map((feature, index) => (
        <Section key={feature.slug}>
          <FeatureDetail feature={feature} reverse={index % 2 === 1} />
        </Section>
      ))}

      <CTASection
        title="Ready to see it in action?"
        copy="Book a 20-minute demo and we'll walk you through the features that matter most to your operation."
      />
    </>
  )
}
