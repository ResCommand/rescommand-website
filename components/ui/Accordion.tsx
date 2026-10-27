'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

export interface AccordionItemData {
  question: string
  answer: React.ReactNode
}

interface AccordionProps {
  items: AccordionItemData[]
  className?: string
  /** Allow multiple panels open at once. Default: single-open. */
  allowMultiple?: boolean
}

/** Accessible disclosure list for FAQs and help sections. */
export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [open, setOpen] = useState<number[]>([])
  const baseId = useId()

  function toggle(index: number) {
    setOpen((prev) => {
      const isOpen = prev.includes(index)
      if (allowMultiple) {
        return isOpen ? prev.filter((i) => i !== index) : [...prev, index]
      }
      return isOpen ? [] : [index]
    })
  }

  return (
    <div className={cn('border-b border-line', className)}>
      {items.map((item, index) => {
        const isOpen = open.includes(index)
        const buttonId = `${baseId}-button-${index}`
        const panelId = `${baseId}-panel-${index}`
        return (
          <div key={index} className="border-t border-line">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left text-body font-medium text-ink"
              >
                <span>{item.question}</span>
                <span className="w-4 flex-shrink-0 text-center text-body text-grey-light" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="max-w-text pb-6 text-[15px] leading-relaxed text-grey"
            >
              {item.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}
