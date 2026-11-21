import { SITE } from '@/lib/constants'

/** Inject a JSON-LD structured-data script. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is static and trusted — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Organization + SoftwareApplication schema for the site root. */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE.supportEmail,
      contactType: 'customer support',
    },
  }
  return <JsonLd data={data} />
}

/** SoftwareApplication schema describing the ResCommand product + pricing. */
export function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    description: SITE.description,
    offers: [
      {
        '@type': 'Offer',
        name: 'Core',
        price: '99',
        priceCurrency: 'USD',
        category: 'monthly subscription',
      },
      {
        '@type': 'Offer',
        name: 'Operator',
        price: '199',
        priceCurrency: 'USD',
        category: 'monthly subscription',
      },
    ],
  }
  return <JsonLd data={data} />
}

/** FAQPage schema. Pass an array of plain-text question/answer pairs. */
export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  return <JsonLd data={data} />
}
