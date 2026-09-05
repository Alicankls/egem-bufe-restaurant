'use client'
import { useMemo, useState } from 'react'
import CategoryBar from './CategoryBar'
import MenuSearch from './MenuSearch'
import MenuItemRow from './MenuItemRow'
import { filterMenuCategories } from '@/lib/menuSearch'
import type { MenuCategory } from '@/data/menu'

export default function MenuContent({ categories }: { categories: MenuCategory[] }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => filterMenuCategories(categories, query), [categories, query])

  return (
    <div>
      <MenuSearch onChange={setQuery} />
      <CategoryBar
        categories={categories.map((c) => ({ key: c.key, title: c.title }))}
        visibleKeys={new Set(filtered.map((c) => c.key))}
      />
      <div className="px-4">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink-soft">Aramanızla eşleşen ürün bulunamadı.</p>}
        {filtered.map((category) => (
          <section key={category.key} id={category.key} className="scroll-mt-32 py-6">
            <h2 className="mb-2 font-display text-lg font-bold text-ink">{category.title}</h2>
            <div>
              {category.items.map((item) => (
                <MenuItemRow key={item.name} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
