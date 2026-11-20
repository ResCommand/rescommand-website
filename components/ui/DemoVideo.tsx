import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'
import { cn } from '@/lib/utils'

/** Self-hosted 16:9 product demo. Shown when no YouTube id is configured. */
const DEMO_SRC = '/videos/rescommand-demo.mp4'
const DEMO_POSTER = '/videos/rescommand-demo-poster.jpg'

interface DemoVideoProps {
  /**
   * YouTube video ID. When set, the YouTube embed is used.
   * When omitted, the self-hosted demo plays.
   */
  videoId?: string
  title?: string
  caption?: string
  className?: string
}

/**
 * Product demo player. A configured YouTube id keeps the existing embed;
 * otherwise this is the self-hosted demo — controls, no autoplay.
 */
export function DemoVideo({
  videoId,
  title = 'ResCommand product demo',
  caption = 'Product Demo Video',
  className,
}: DemoVideoProps) {
  if (videoId) {
    return <YouTubeEmbed videoId={videoId} title={title} caption={caption} className={className} />
  }

  return (
    <div className={cn('w-full min-w-0 max-w-full overflow-hidden rounded-md', className)}>
      <video
        className="block aspect-video h-auto w-full min-w-0 max-w-full rounded-md border border-line bg-ink object-cover"
        controls
        playsInline
        preload="metadata"
        poster={DEMO_POSTER}
        width={1920}
        height={1080}
        aria-label={title}
      >
        <source src={DEMO_SRC} type="video/mp4" />
      </video>
    </div>
  )
}
