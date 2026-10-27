import type { ReactNode } from 'react'
import { Container } from './Container'
import { Label } from './SectionHeading'

interface PageHeroProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}

/** Inner-page hero: tiny label, one huge line, one small supporting line. */
export function PageHero({ eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section>
      <Container className="pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pt-28">
        <div className="flex flex-col items-start gap-6">
          {eyebrow && <Label>{eyebrow}</Label>}
          <h1 className="max-w-5xl text-hero text-balance">{title}</h1>
          {subtitle && <p className="max-w-text text-body text-grey">{subtitle}</p>}
          {children}
        </div>
      </Container>
    </section>
  )
}
