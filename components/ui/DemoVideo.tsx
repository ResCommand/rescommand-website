import { YouTubeEmbed } from '@/components/ui/YouTubeEmbed'
import { cn } from '@/lib/utils'

/** Landscape demo for md and up. Vertical cut is for phones. */
const DEMO_SRC = '/videos/rescommand-demo.mp4'
const DEMO_POSTER = '/videos/rescommand-demo-poster.jpg'
const DEMO_VERTICAL_SRC = '/videos/rescommand-demo-vertical.mp4?v=2'
const DEMO_VERTICAL_POSTER = '/videos/rescommand-demo-poster-vertical.jpg?v=2'

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
 * Product demo player. A configured YouTube id keeps the existing embed.
 * Otherwise phones get the vertical cut and md+ gets the 16:9 file.
 * preload="none" so a phone does not fetch the hidden landscape file.
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
    <div className={cn('w-full min-w-0 max-w-full', className)}>
      <div className="mx-auto w-fit overflow-hidden rounded bg-transparent md:hidden">
        <video
          className="block aspect-[1080/2492] h-auto w-[min(94vw,calc(100vw_-_24px),calc(88svh_*_1080_/_2492))] max-w-none bg-transparent object-contain"
          controls
          playsInline
          preload="none"
          poster={DEMO_VERTICAL_POSTER}
          width={1080}
          height={2492}
          aria-label={title}
        >
          <source src={DEMO_VERTICAL_SRC} type="video/mp4" />
        </video>
      </div>
      <video
        className="hidden aspect-video h-auto w-full min-w-0 max-w-full rounded-md border border-line bg-ink object-cover md:block"
        controls
        playsInline
        preload="none"
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
