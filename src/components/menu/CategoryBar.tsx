'use client'
import { cn } from '@/lib/utils'
import { useActiveSection } from '@/lib/useActiveSection'

type CategoryBarProps = {
  categories: { key: string; title: string }[]
  visibleKeys: Set<string>
}

export default function CategoryBar({ categories, visibleKeys }: CategoryBarProps) {
  const activeId = useActiveSection(categories.map((c) => c.key))

  function scrollToCategory(key: string) {
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="sticky top-16 z-30 overflow-x-auto border-b border-line bg-white">
      <div className="flex gap-2 px-4 py-3">
        {categories.map((category) => {
          const isVisible = visibleKeys.has(category.key)
          return (
            <button
              key={category.key}
              onClick={() => isVisible && scrollToCategory(category.key)}
              disabled={!isVisible}
              aria-disabled={!isVisible}
              className={cn(
                'flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-semibold',
                !isVisible
                  ? 'cursor-not-allowed border-line text-ink-soft/40'
                  : activeId === category.key
                    ? 'border-accent-500 text-brand-500'
                    : 'border-line text-ink-soft'
              )}
            >
              {category.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
