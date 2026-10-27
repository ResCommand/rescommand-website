'use client'

import Script from 'next/script'

/**
 * Calendly inline embed. Rendered only when `NEXT_PUBLIC_CALENDLY_URL` is set;
 * otherwise the demo page falls back to the custom <DemoForm />.
 */
export function CalendlyEmbed({ url }: { url: string }) {
  return (
    <>
      <div
        className="calendly-inline-widget min-h-[680px] w-full overflow-hidden rounded-md border border-line"
        data-url={url}
        aria-label="Calendly scheduling widget"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  )
}
