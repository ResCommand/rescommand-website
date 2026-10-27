import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { ProblemSection } from '@/components/home/ProblemSection'
import { SolutionSection } from '@/components/home/SolutionSection'
import { FeaturesGrid } from '@/components/home/FeaturesGrid'
import { VideoSection } from '@/components/home/VideoSection'
import { TestimonialSection } from '@/components/home/TestimonialSection'
import { PricingPreview } from '@/components/home/PricingPreview'
import { CTASection } from '@/components/ui/CTASection'

export const metadata: Metadata = {
  title: 'Restaurant Operations, Handled',
  description:
    'ResCommand is one app for restaurant scheduling, inventory, recipes, prep, and compliance — built for small restaurants and priced for them, too.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeaturesGrid />
      <VideoSection />
      <TestimonialSection />
      <PricingPreview />
      <CTASection
        title="Ready to Run Better?"
        copy="Let's see if ResCommand is right for you."
        secondaryLabel="Explore features first"
        secondaryHref="/features"
      />
    </>
  )
}
