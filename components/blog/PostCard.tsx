import Link from 'next/link'
import { Label } from '@/components/ui/SectionHeading'
import { formatDate } from '@/lib/utils'
import type { PostMeta } from '@/lib/blogMeta'

/** Blog post entry on a hairline: category, title, excerpt, meta. The whole title is the link. */
export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="flex flex-col gap-3 border-t border-line py-6">
      <Label>{post.category}</Label>
      <h3 className="text-body font-medium leading-snug">
        <Link href={`/blog/${post.slug}`} className="text-ink hover:text-signal">
          {post.title}
        </Link>
      </h3>
      <p className="text-[15px] text-grey">{post.excerpt}</p>
      <p className="mt-auto flex gap-3 text-small text-grey-light">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readTime} min read</span>
      </p>
    </article>
  )
}
