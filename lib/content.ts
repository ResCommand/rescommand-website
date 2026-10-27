/**
 * Marketing content data — problems, features, pricing, testimonials, FAQs.
 * Kept here so the same source feeds the home, features, pricing, and help pages.
 */
export interface ProblemItem {
  title: string
  copy: string
}

export const PROBLEMS: ProblemItem[] = [
  {
    title: 'Scheduling Chaos',
    copy: 'Spreadsheets, group texts, last-minute no-shows. Your best staff is scattered across five different scheduling apps.',
  },
  {
    title: 'Food Cost Bleeding',
    copy: "You don't know if your prep is efficient. Par sheets were printed six months ago. Waste is silent — and it adds up.",
  },
  {
    title: 'Compliance Invisibility',
    copy: "Cleaning logs, SOP adherence, temperature checks — scattered across people's memories instead of a system.",
  },
]

export interface FeatureItem {
  title: string
  short: string
  slug: string
  /** App screen to show for this feature (phone-frame screenshot). */
  screen: string
  problem: string
  solution: string
  benefit: string
  bullets: string[]
}

export const FEATURES: FeatureItem[] = [
  {
    title: 'Team Scheduling',
    short: 'Mobile-friendly schedule builder. Alerts, shifts, auto-assignments.',
    slug: 'team-scheduling',
    screen: 'Team schedule — this week',
    problem:
      'Schedules live in spreadsheets and group texts. Changes get lost, shifts go uncovered, and no-shows blindside you.',
    solution:
      'A drag-and-drop builder your team checks from their phones. Publish once and everyone sees their shifts instantly — with SMS alerts when anything changes.',
    benefit: 'Your team sees their schedule the moment it changes. No more group texts, no more guessing.',
    bullets: [
      'Drag-and-drop shift building',
      'SMS alerts for schedule changes',
      'Self-service availability picking',
      'Overtime flagging before it costs you',
    ],
  },
  {
    title: 'Inventory & Par',
    short: 'Real-time inventory levels vs. par sheets. Know what’s running low.',
    slug: 'inventory-par',
    screen: 'Inventory — count to par',
    problem:
      "Par sheets are printed and outdated. You only learn you're out of something when a customer orders it.",
    solution:
      'Live stock levels checked against your pars, with usage trends and low-stock alerts so you reorder at the right time — not too early, not too late.',
    benefit: 'You always know what to order and when. Less waste, fewer 86s, tighter food cost.',
    bullets: [
      'Live stock levels',
      'Par sheet comparison',
      'Usage trending over time',
      'Low-stock alerts',
    ],
  },
  {
    title: 'Recipes, Prep & Yield',
    short: 'Standardized recipes, prep schedules, yield tracking.',
    slug: 'recipes-prep',
    screen: 'Prep list — today’s batches',
    problem:
      'Recipes live in notebooks and people’s heads. Consistency depends on who showed up that morning.',
    solution:
      'Standardized recipes with prep schedules and yield tracking, so every batch comes out the same — no matter who is on the line.',
    benefit: 'Consistent product every shift, and a prep plan your whole team can follow.',
    bullets: [
      'Standardized recipes',
      'Prep scheduling',
      'Yield tracking',
      'Batch documentation',
    ],
  },
  {
    title: 'Compliance & Docs',
    short: 'Digital logs for cleaning, temps, SOPs. Built-in workflows.',
    slug: 'compliance',
    screen: 'Opening checklist & temp log',
    problem:
      'Cleaning logs and temperature checks are on clipboards — or in someone’s memory. Audits become a scramble.',
    solution:
      'Digital logs for temperatures, cleaning, and SOPs with built-in workflows, so the record is captured as the work happens and you stay audit-ready.',
    benefit: 'Walk into any inspection with a complete, timestamped record already in hand.',
    bullets: [
      'Temperature logs',
      'Cleaning checklists',
      'SOP tracking',
      'Audit-ready documentation',
    ],
  },
]

export interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
  /** Stand-in copy, not a real customer. Hidden on the site until replaced. */
  placeholder?: boolean
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'We went from sticky notes and group texts to one place the whole team actually checks. Prep is calmer and nothing falls through the cracks.',
    name: 'Catherine Williamson',
    role: 'Head Baker, Duffers Donuts — Charleston, SC',
    initials: 'CW',
  },
  {
    quote:
      'I finally know my food cost without spending Sunday night in a spreadsheet. The par alerts alone paid for it.',
    name: 'Sample Owner',
    role: 'Owner-Operator, Multi-Unit Café',
    initials: 'SO',
    placeholder: true,
  },
  {
    quote:
      'Our last health inspection took ten minutes because every log was already there, timestamped and organized.',
    name: 'Sample Manager',
    role: 'General Manager, Neighborhood Bakery',
    initials: 'SM',
    placeholder: true,
  },
]

export interface PricingTier {
  name: string
  price: string
  cadence: string
  blurb: string
  cta: string
  featured?: boolean
  highlights: string[]
}

export interface PricingFeatureRow {
  label: string
  starter: string | boolean
  pro: string | boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Core',
    price: '$99',
    cadence: '/mo',
    blurb: 'Everything one location needs to run like a big operation.',
    cta: 'Start Free Trial',
    highlights: [
      '1 location',
      'Up to 15 team members',
      'Scheduling, inventory, recipes & compliance',
      'Email support',
    ],
  },
  {
    name: 'Operator',
    price: '$199',
    cadence: '/mo',
    blurb: 'Built for growing, multi-unit operators who need more.',
    cta: 'Start Free Trial',
    featured: true,
    highlights: [
      'Up to 3 locations',
      'Up to 45 team members',
      'Everything in Core',
      'API access & priority support',
    ],
  },
]

export const PRICING_COMPARISON: PricingFeatureRow[] = [
  { label: 'Locations', starter: '1', pro: 'Up to 3' },
  { label: 'Team Members', starter: 'Up to 15', pro: 'Up to 45' },
  { label: 'Scheduling', starter: true, pro: true },
  { label: 'Inventory & Par', starter: true, pro: true },
  { label: 'Recipes & Prep', starter: true, pro: true },
  { label: 'Compliance Logs', starter: true, pro: true },
  { label: 'API Access', starter: false, pro: true },
  { label: 'Priority Support', starter: false, pro: true },
]

export const PRICING_FAQ = [
  {
    question: "What's included in the free trial?",
    answer:
      'Full access to every feature in your chosen plan for 14 days. No credit card required, no feature gates — set up your real operation and see if it fits.',
  },
  {
    question: 'Can I change plans anytime?',
    answer:
      'Yes. Upgrade or downgrade whenever you need to. Changes take effect on your next billing cycle and we prorate the difference.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer:
      'We do — annual plans save you roughly two months versus paying monthly. Reach out and we’ll set it up.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'Never. No setup fees, no onboarding fees, no contracts. You can cancel anytime.',
  },
  {
    question: 'What if I need more than 3 locations?',
    answer:
      'We’ve got you. Contact us and we’ll put together a multi-unit plan sized to your group.',
  },
  {
    question: 'Do you have an API?',
    answer:
      'Yes — API access is included on the Operator plan so you can connect ResCommand to the rest of your stack.',
  },
]
