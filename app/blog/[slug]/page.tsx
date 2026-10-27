import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Label, SectionHeading } from '@/components/ui/SectionHeading'
import { CTASection } from '@/components/ui/CTASection'
import { PostMeta } from '@/components/blog/PostMeta'
import { PostCard } from '@/components/blog/PostCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blogMeta'
import { SITE } from '@/lib/constants'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  }

  return (
    <>
      <JsonLd data={articleSchema} />

      <article>
        {/* Header */}
        <header>
          <Container className="pb-12 pt-10 sm:pt-16">
            <div className="flex flex-col items-start">
              <Link
                href="/blog"
                className="mb-10 inline-flex min-h-[44px] items-center text-small font-medium text-signal hover:text-signal-hover"
              >
                ← Back to blog
              </Link>
              <Label>{post.category}</Label>
              <h1 className="mt-5 max-w-4xl text-huge text-balance">{post.title}</h1>
              <p className="mt-6 max-w-text text-body text-grey">{post.excerpt}</p>
              <PostMeta author={post.author} date={post.date} readTime={post.readTime} className="mt-6" />
            </div>
          </Container>
        </header>

        {/* Featured image + body */}
        <div>
          <Container className="pb-20 sm:pb-28">
            <div className="border-t border-line pt-12">
              <div className="prose-rescommand">
                <MDXRemote source={post.content} />
              </div>
            </div>
          </Container>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <Section aria-labelledby="related-heading">
          <SectionHeading title={<span id="related-heading">Keep reading</span>} />
          <div className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => (
              <PostCard key={rel.slug} post={rel} />
            ))}
          </div>
        </Section>
      )}

      <CTASection
        title="Ready to try ResCommand?"
        copy="Book a demo and see how it fits your operation."
      />
    </>
  )
}
