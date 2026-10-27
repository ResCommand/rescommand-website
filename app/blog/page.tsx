import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Section } from '@/components/ui/Section'
import { CTASection } from '@/components/ui/CTASection'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { getSortedPosts } from '@/lib/blogMeta'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Practical restaurant operations tips and insights — scheduling, food cost, compliance, and running a small restaurant like a big operation.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  const posts = getSortedPosts()

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Restaurant Operations Tips & Insights"
        subtitle="Practical guides for restaurant owners and teams."
      />

      <Section>
        <BlogGrid posts={posts} />
      </Section>

      <CTASection
        title="Ready to try ResCommand?"
        copy="See how the right tools turn these tips into everyday reality for your team."
      />
    </>
  )
}
