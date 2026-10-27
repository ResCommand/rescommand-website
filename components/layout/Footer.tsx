import Link from 'next/link'
import { FOOTER_NAV, SITE } from '@/lib/constants'
import { Container } from '@/components/ui/Container'
import { Logo } from './Logo'

const YEAR = 2025

/** Small grey footer under a hairline: brand blurb, product/company links, contact, credit. */
export function Footer() {
  return (
    <footer>
      <Container className="border-t border-line py-14 text-small text-grey">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-3 lg:col-span-1">
            <Link href="/" aria-label="ResCommand home" className="self-start">
              <Logo className="text-[16px]" />
            </Link>
            <p className="max-w-xs">{SITE.tagline}</p>
          </div>

          {/* Product */}
          <FooterColumn title={FOOTER_NAV.product.title} links={FOOTER_NAV.product.links} />

          {/* Company */}
          <FooterColumn title={FOOTER_NAV.company.title} links={FOOTER_NAV.company.links} />

          {/* Contact + credit */}
          <div className="col-span-2 flex flex-col gap-3 lg:col-span-1">
            <h2 className="font-medium text-ink">Contact</h2>
            <a href={`mailto:${SITE.supportEmail}`} className="self-start hover:text-ink">
              {SITE.supportEmail}
            </a>
            <p>
              ResCommand is built by{' '}
              <a href={SITE.builtBy.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                {SITE.builtBy.name}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-grey-light">
          © {YEAR} ResCommand. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: readonly { label: string; href: string }[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-medium text-ink">{title}</h2>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            {/* The app lives on its own domain, so it gets a plain anchor. */}
            {link.href.startsWith('http') ? (
              <a href={link.href} className="inline-flex min-h-[32px] items-center hover:text-ink">
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="inline-flex min-h-[32px] items-center hover:text-ink">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
