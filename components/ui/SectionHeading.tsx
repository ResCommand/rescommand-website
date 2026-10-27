import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  titleClassName?: string
}

/** Tiny label + one huge line + one small supporting line. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  as: Heading = 'h2',
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col items-start gap-5', className)}>
      {eyebrow && <Label>{eyebrow}</Label>}
      <Heading className={cn('max-w-4xl text-balance', Heading === 'h1' ? 'text-hero' : 'text-huge', titleClassName)}>
        {title}
      </Heading>
      {subtitle && <p className="max-w-text text-body text-grey">{subtitle}</p>}
    </div>
  )
}

/** Tiny grey all-caps label — the only place all-caps is allowed. */
export function Label({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn('text-label font-medium uppercase text-grey', className)}>{children}</span>
}
