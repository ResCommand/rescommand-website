import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/constants'
import { getAllPostSlugs } from '@/lib/blogMeta'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/features',
    '/pricing',
    '/demo',
    '/blog',
    '/guides/how-to-build-a-weekly-staff-schedule',
    '/about',
    '/help',
    '/privacy',
    '/terms',
  ]

  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/blog' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))

  const blogEntries: MetadataRoute.Sitemap = getAllPostSlugs().map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...blogEntries]
}
