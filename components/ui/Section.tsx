import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Container } from './Container'

interface SectionProps {
  className?: string
  containerClassName?: string
  /** When false, children are rendered without the inner Container wrapper. */
  contained?: boolean
  /** Hairline divider above the section. On by default; off for the first section on a page. */
  divider?: boolean
  id?: string
  children: ReactNode
  'aria-labelledby'?: string
}

/** Full-width vertical section on paper, separated from the last one by a hairline. */
export function Section({
  className,
  containerClassName,
  contained = true,
  divider = true,
  id,
  children,
  ...rest
}: SectionProps) {
  return (
    <section id={id} className={cn('section', divider && contained && 'pt-0 sm:pt-0 lg:pt-0', className)} {...rest}>
      {contained ? (
        <Container className={cn(divider && 'border-t border-line pt-20 sm:pt-28 lg:pt-32', containerClassName)}>
          {children}
        </Container>
      ) : (
        children
      )}
    </section>
  )
}
