'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface YouTubeEmbedProps {
  /** YouTube video ID. When omitted, renders a styled placeholder. */
  videoId?: string
  title?: string
  caption?: string
  className?: string
}

/**
 * Lazy YouTube embed. Until the user clicks play (or if no ID is configured),
 * it shows a lightweight branded placeholder — no iframe, no extra weight.
 */
export function YouTubeEmbed({
  videoId,
  title = 'Product demo video',
  caption = 'Product Demo Video',
  className,
}: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const hasVideo = Boolean(videoId)

  if (hasVideo && playing) {
    return (
      <div className={cn('relative aspect-video w-full overflow-hidden rounded-md', className)}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => hasVideo && setPlaying(true)}
      aria-label={hasVideo ? `Play ${title}` : `${title} (coming soon)`}
      className={cn(
        'group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-line',
        hasVideo ? 'cursor-pointer' : 'cursor-default border-dashed',
        className,
      )}
    >
      {hasVideo && (
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      )}
      <span className="relative z-10 flex flex-col items-center gap-3 text-center">
        {hasVideo ? (
          <span className="flex h-12 items-center rounded bg-signal px-6 text-[15px] font-medium text-white transition-colors group-hover:bg-signal-hover">
            ▶&nbsp;&nbsp;{caption}
          </span>
        ) : (
          <>
            <span className="text-small font-medium text-ink">{caption}</span>
            <span className="text-small text-grey-light">Video coming soon</span>
          </>
        )}
      </span>
    </button>
  )
}
