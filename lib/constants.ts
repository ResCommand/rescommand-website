/**
 * Site-wide constants: brand metadata, navigation, contact info.
 * Centralised so copy and links stay consistent across every page.
 */

export const SITE = {
  name: 'ResCommand',
  tagline: 'Everything a restaurant team needs to run like a big operation.',
  description:
    'ResCommand is one app for restaurant scheduling, inventory, recipes, prep, and compliance — built for small restaurants and priced for them, too.',
  url: 'https://rescommand.com',
  appUrl: 'https://app.rescommand.com',
  supportEmail: 'support@rescommand.com',
  ogImage: '/images/og-default.svg',
  builtBy: {
    name: 'Venturio Studios',
    url: 'https://venturiostudios.com',
  },
} as const

export const PRIMARY_NAV = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Demo', href: '/demo' },
  { label: 'Blog', href: '/blog' },
  { label: 'Help', href: '/help' },
] as const

export const FOOTER_NAV = {
  product: {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
      { label: 'Demo', href: '/demo' },
      { label: 'Log in', href: SITE.appUrl },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Help / FAQ', href: '/help' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
} as const

/** Blog categories used for filtering and tagging posts. */
export const BLOG_CATEGORIES = [
  'All',
  'Scheduling',
  'Food Cost',
  'Compliance',
  'Operations',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]
