import { formatDate } from '@/lib/utils'

interface PostMetaProps {
  author?: string
  date: string
  readTime: string
  className?: string
}

/** Inline byline row: author · date · read time. */
export function PostMeta({ author, date, readTime, className }: PostMetaProps) {
  const parts = [
    author && <span key="author">{author}</span>,
    <time key="date" dateTime={date}>
      {formatDate(date)}
    </time>,
    <span key="read">{readTime} min read</span>,
  ].filter(Boolean)

  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-grey ${className ?? ''}`}>
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-3">
          {i > 0 && <span aria-hidden="true">·</span>}
          {part}
        </span>
      ))}
    </p>
  )
}
