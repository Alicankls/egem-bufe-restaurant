import Link from 'next/link'
import { cn } from '@/lib/utils'

type MenuTabsProps = {
  active: 'restaurant' | 'bufe'
}

const tabs = [
  { key: 'restaurant', label: 'RESTAURANT' },
  { key: 'bufe', label: 'BÜFE' },
] as const

export default function MenuTabs({ active }: MenuTabsProps) {
  return (
    <div role="tablist" aria-label="Menü seçimi" className="grid grid-cols-2 border-b border-line">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/menu?tab=${tab.key}`}
          role="tab"
          aria-selected={active === tab.key}
          className={cn(
            'flex min-h-[52px] items-center justify-center text-[15px] font-bold uppercase tracking-[0.04em]',
            active === tab.key ? 'border-b-2 border-brand-500 text-brand-500' : 'text-ink-soft'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
