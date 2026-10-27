import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

/**
 * Typographic wordmark in ink, matching the app. The colored Ops Scope lockup
 * (public/brand) stays available for places outside the ink-and-paper system.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span className={cn('text-[19px] font-extrabold tracking-[-0.04em] text-ink', className)}>
      ResCommand
    </span>
  )
}
