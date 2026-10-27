import Link from 'next/link'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'link'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'rounded bg-signal text-white hover:bg-signal-hover',
  link: 'min-h-[44px] text-signal underline-offset-4 hover:text-signal-hover hover:underline',
}

const sizes: Record<Size, string> = {
  sm: 'h-11 px-4 text-small',
  md: 'h-12 px-6 text-[15px]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> {
  href?: undefined
}

interface ButtonAsLink extends CommonProps {
  href: string
  external?: boolean
}

type ButtonProps = ButtonAsButton | ButtonAsLink

/**
 * Polymorphic button — renders a styled `<button>` or an `<a>`/`next/link`
 * when an `href` is supplied. `primary` is the one filled blue button a
 * section may carry; `link` is blue text for everything else clickable.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, ...props },
  ref,
) {
  const classes = cn(base, variants[variant], variant === 'primary' && sizes[size], className)

  if ('href' in props && props.href !== undefined) {
    const { href, external, ...rest } = props as ButtonAsLink
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  const buttonProps = props as ButtonAsButton
  return (
    <button ref={ref} className={classes} {...buttonProps}>
      {children}
    </button>
  )
})
