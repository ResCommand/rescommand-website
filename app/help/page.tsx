import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Section } from '@/components/ui/Section'
import { CTASection } from '@/components/ui/CTASection'
import { Accordion, type AccordionItemData } from '@/components/ui/Accordion'
import { FaqJsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description:
    'Answers to common questions about ResCommand — getting started, pricing & billing, features, integrations, and support.',
  alternates: { canonical: '/help' },
}

interface HelpGroup {
  heading: string
  items: { question: string; answer: string }[]
}

const HELP: HelpGroup[] = [
  {
    heading: 'Getting Started',
    items: [
      {
        question: 'How do I sign up?',
        answer:
          'Start a free 14-day trial from the pricing page, or book a demo and we’ll get you set up. No credit card required to begin.',
      },
      {
        question: 'Is there a free trial?',
        answer:
          'Yes — every plan includes a full-feature 14-day free trial so you can run your real operation before you decide.',
      },
      {
        question: 'What does the onboarding process look like?',
        answer:
          'We help you import your team, build your first schedule, and set up your pars and core logs. Most shops are up and running within a day.',
      },
      {
        question: 'Do you offer a demo first?',
        answer:
          'Absolutely. Book a 20-minute demo and we’ll walk you through the features that matter most to your operation.',
      },
    ],
  },
  {
    heading: 'Pricing & Billing',
    items: [
      {
        question: 'What’s included in each plan?',
        answer:
          'Core covers one location and up to 15 team members. Operator covers up to 3 locations, up to 45 team members, API access, and priority support. Both include scheduling, inventory, recipes, and compliance.',
      },
      {
        question: 'Can I change plans anytime?',
        answer:
          'Yes — upgrade or downgrade whenever you need. Changes take effect on your next billing cycle and we prorate the difference.',
      },
      {
        question: 'Do you offer annual discounts?',
        answer: 'We do. Annual billing saves you roughly two months versus paying monthly.',
      },
      {
        question: 'What happens if I cancel?',
        answer:
          'You can cancel anytime — no contracts, no cancellation fees. Your data stays available for export through the end of your billing period.',
      },
      {
        question: 'Do you have volume discounts for multi-unit operators?',
        answer:
          'Yes. If you run more than five locations, contact us and we’ll build a plan sized to your group.',
      },
    ],
  },
  {
    heading: 'Features & Functionality',
    items: [
      {
        question: 'Can I import my current scheduling data?',
        answer:
          'Yes. We help you import your team roster and existing availability during onboarding so you’re not starting from scratch.',
      },
      {
        question: 'Is ResCommand mobile-friendly?',
        answer:
          'Completely. Your team checks schedules, logs tasks, and updates inventory right from their phones.',
      },
      {
        question: 'Can I set up different user permissions?',
        answer:
          'Yes — assign roles so owners, managers, and staff each see exactly what they need and nothing they don’t.',
      },
      {
        question: 'How do I add recipes to the system?',
        answer:
          'Add recipes with ingredients, steps, and expected yield. Attach them to prep schedules so your team knows what to make and how much.',
      },
      {
        question: 'Can I customize par sheets?',
        answer:
          'Yes. Set pars per item and per day-of-week, and adjust them anytime as your volume changes.',
      },
    ],
  },
  {
    heading: 'Integration & API',
    items: [
      {
        question: 'Does ResCommand connect to other tools?',
        answer:
          'We’re expanding integrations across POS and accounting systems. Tell us what you use and we’ll let you know where it stands.',
      },
      {
        question: 'Is there an API?',
        answer: 'Yes — API access is included on the Operator plan so you can connect ResCommand to your stack.',
      },
      {
        question: 'Can I export my data?',
        answer: 'Always. Your data is yours — export it anytime in standard formats.',
      },
    ],
  },
  {
    heading: 'Support & Account',
    items: [
      {
        question: 'How do I contact support?',
        answer: `Email us at ${SITE.supportEmail} and we’ll get back to you quickly. Operator plans include priority support.`,
      },
      {
        question: 'What’s your response time?',
        answer:
          'We aim to respond within one business day — faster for Operator customers and anything time-sensitive on the floor.',
      },
      {
        question: 'Do you offer training?',
        answer:
          'Yes. Onboarding includes hands-on setup help, and we have guides plus live support whenever you need a refresher.',
      },
      {
        question: 'Can I change my account password?',
        answer: 'Anytime, from your account settings. Reach out if you ever get locked out and we’ll help.',
      },
    ],
  },
]

export default function HelpPage() {
  const allFaqs = HELP.flatMap((group) => group.items)

  return (
    <>
      <FaqJsonLd items={allFaqs} />

      <PageHero
        eyebrow="Help Center"
        title="How Can We Help?"
        subtitle="Answers to common questions about ResCommand."
      />

      <Section>
        <div className="flex max-w-3xl flex-col gap-16">
          {HELP.map((group) => (
            <div key={group.heading} className="flex flex-col gap-4">
              <h2 className="text-label font-medium uppercase text-grey">{group.heading}</h2>
              <Accordion items={group.items as AccordionItemData[]} allowMultiple />
            </div>
          ))}
        </div>
      </Section>

      <CTASection
        title="Still Have Questions?"
        copy="Reach out to our team. We're here to help."
        primaryLabel="Email Support"
        primaryHref={`mailto:${SITE.supportEmail}`}
      />
    </>
  )
}
