import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PhoneFrameProps {
  /** Which app screen belongs here, e.g. "Inventory — count to par". */
  screen: string
  /** Screenshot path under /public. Until one exists, nothing renders. */
  src?: string
  className?: string
  priority?: boolean
}

/**
 * Plain phone outline around a real app screenshot (390×844). With no `src`
 * it renders nothing, so the live site never shows an empty frame.
 */
export function PhoneFrame({ screen, src, className, priority }: PhoneFrameProps) {
  if (!src) return null

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[300px] rounded-[40px] border border-ink/80 bg-paper p-2.5',
        className,
      )}
    >
      <div className="relative aspect-[390/844] overflow-hidden rounded-[31px] border border-line bg-white">
        <Image src={src} alt={`ResCommand app: ${screen}`} fill sizes="300px" className="object-cover" priority={priority} />
      </div>
    </div>
  )
}
