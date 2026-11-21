import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

const shareImage = {
  url: SITE.ogImage,
  width: 1200,
  height: 630,
  alt: SITE.name,
}

/**
 * Per-page metadata so each route sets its own canonical and og:url.
 * Setting openGraph on a page replaces the root openGraph, so the share
 * image is included here rather than inherited.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  authors,
}: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  publishedTime?: string
  authors?: string[]
}): Metadata {
  const openGraph =
    type === 'article'
      ? {
          type: 'article' as const,
          url: path,
          siteName: SITE.name,
          title,
          description,
          images: [shareImage],
          ...(publishedTime ? { publishedTime } : {}),
          ...(authors ? { authors } : {}),
        }
      : {
          type: 'website' as const,
          url: path,
          siteName: SITE.name,
          title,
          description,
          images: [shareImage],
        }

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE.ogImage],
    },
  }
}
