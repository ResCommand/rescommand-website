'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { PRIMARY_NAV, SITE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Logo } from './Logo'

/** Sticky site header: wordmark, primary nav, "Log in" to the app, "Book a Demo" + mobile menu. */
export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-[300] border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <nav className="container-safe flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <Link href="/" className="flex min-h-[44px] items-center" aria-label="ResCommand home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'text-small font-medium transition-colors',
                    active ? 'text-signal' : 'text-ink hover:text-signal',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-6 md:flex">
          <a href={SITE.appUrl} className="text-small font-medium text-signal hover:text-signal-hover">
            Log in
          </a>
          <Button href="/demo" size="sm">
            Book a Demo
          </Button>
        </div>

        {/* Mobile: log in stays one tap away; everything else lives in the menu */}
        <div className="flex items-center gap-1 md:hidden">
          <a
            href={SITE.appUrl}
            className="inline-flex h-11 items-center px-3 text-small font-medium text-signal"
          >
            Log in
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded text-ink"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-paper md:hidden">
          <ul className="container-safe flex flex-col py-2">
            {PRIMARY_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[52px] items-center text-body font-medium',
                      active ? 'text-signal' : 'text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li className="pb-4 pt-5">
              <Button href="/demo" className="w-full">
                Book a Demo
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
