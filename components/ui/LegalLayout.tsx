import type { ReactNode } from 'react'
import { PageHero } from './PageHero'
import { Container } from './Container'

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  children: ReactNode
}

/** Shared wrapper for Privacy / Terms — narrow, readable legal prose. */
export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle={`Last updated: ${lastUpdated}`} />
      <div className="pb-20 sm:pb-28">
        <Container>
          <div className="prose-rescommand border-t border-line pt-12">
            <p className="text-small text-grey">
              This is placeholder legal text provided for layout purposes. Replace it with your
              finalized policy, reviewed by qualified counsel, before launch.
            </p>
            {children}
          </div>
        </Container>
      </div>
    </>
  )
}
