import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PhoneFrameProps {
  /** Which app screen belongs here, e.g. "Inventory — count to par". */
  screen: string
  /** Screenshot path under /public. Until one exists, a labeled placeholder shows. */
  src?: string
  className?: string
  priority?: boolean
}

/**
 * Plain phone outline around a real app screenshot (390×844). With no `src`
 * it renders a clearly labeled empty screen so missing shots are obvious.
 */
export function PhoneFrame({ screen, src, className, priority }: PhoneFrameProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[300px] rounded-[40px] border border-ink/80 bg-paper p-2.5',
        className,
      )}
    >
      <div className="relative aspect-[390/844] overflow-hidden rounded-[31px] border border-line bg-white">
        {src ? (
          <Image src={src} alt={`ResCommand app: ${screen}`} fill sizes="300px" className="object-cover" priority={priority} />
        ) : (
          <div
            role="img"
            aria-label={`ResCommand app: ${screen} (screenshot placeholder)`}
            className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center"
          >
            <span className="text-label font-medium uppercase text-grey-light">Screenshot needed</span>
            <span className="text-small text-grey">{screen}</span>
          </div>
        )}
      </div>
    </div>
  )
}
