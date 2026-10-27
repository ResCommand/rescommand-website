import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SITE } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GoogleAnalytics } from '@/components/seo/GoogleAnalytics'
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd'
import '@/styles/globals.css'

// One family, two weights: 800 for the huge lines, 400/500 for everything else.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — Restaurant Operations, Handled`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'restaurant scheduling software',
    'restaurant inventory management',
    'food cost control',
    'restaurant compliance logs',
    'small restaurant operations',
    'recipe management',
  ],
  authors: [{ name: SITE.builtBy.name, url: SITE.builtBy.url }],
  creator: SITE.builtBy.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: SITE.name,
    title: `${SITE.name} — Restaurant Operations, Handled`,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Restaurant Operations, Handled`,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[999] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <OrganizationJsonLd />
        <SoftwareApplicationJsonLd />
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
