'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccordionItem = { question: string; answer: string }

export default function Accordion({ items, defaultOpenIndex = 0 }: { items: AccordionItem[]; defaultOpenIndex?: number | null }) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set(defaultOpenIndex !== null ? [defaultOpenIndex] : []))

  const toggleItem = (index: number) => {
    const newIndices = new Set(openIndices)
    if (newIndices.has(index)) {
      newIndices.delete(index)
    } else {
      newIndices.add(index)
    }
    setOpenIndices(newIndices)
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {items.map((item, i) => {
        const isOpen = openIndices.has(i)
        return (
          <div key={item.question}>
            <button
              onClick={() => toggleItem(i)}
              aria-expanded={isOpen}
              className={cn(
                'flex min-h-[44px] w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-semibold',
                isOpen ? 'text-brand-500' : 'text-ink'
              )}
            >
              {item.question}
              <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            {isOpen && <p className="pb-4 text-sm leading-[1.6] text-ink-soft">{item.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}
