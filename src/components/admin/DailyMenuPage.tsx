'use client'
import { useMemo, useState, useTransition } from 'react'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Toggle from './Toggle'
import { toggleProductField } from '@/lib/actions/products'
import { formatPrice } from '@/lib/utils'
import type { ProductWithCategory } from '@/lib/queries/products'
import type { Business } from '@prisma/client'

export default function DailyMenuPage({
  business,
  initialProducts,
}: {
  business: Business
  initialProducts: ProductWithCategory[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [, startTransition] = useTransition()

  const publicHref = business === 'RESTAURANT' ? '/restaurant' : '/bufe'

  const selectedCount = useMemo(() => products.filter((p) => p.isDailyMenu).length, [products])

  const grouped = useMemo(() => {
    const map = new Map<string, { categoryName: string; items: ProductWithCategory[] }>()
    for (const product of products) {
      const key = product.categoryId
      if (!map.has(key)) map.set(key, { categoryName: product.category.name, items: [] })
      map.get(key)!.items.push(product)
    }
    return Array.from(map.values())
  }, [products])

  function handleToggle(product: ProductWithCategory, field: 'isSoldOut' | 'isDailyMenu', next: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: next } : p)))
    startTransition(async () => {
      const result = await toggleProductField(product.id, field, next)
      if (result.error) {
        toast.error(result.error)
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: !next } : p)))
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Günün Menüsü</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {business === 'BUFE'
              ? 'Bu seçim şu an canlı sitede gösterilmiyor, ileride kullanılmak üzere hazırda tutulur.'
              : 'Bugün menüde olacak ürünleri işaretleyin. Değişiklikler anında müşteri menüsüne yansır.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Menüyü Görüntüle
          </a>
          <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            Şu anda seçili: {selectedCount} ürün
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {grouped.map((group) => (
          <div key={group.categoryName} className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-soft">{group.categoryName}</h2>
            <div className="flex flex-col divide-y divide-line">
              {group.items.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{product.name}</p>
                      {product.isSoldOut && (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                          Tükendi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft">{formatPrice(Number(product.price))}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-ink-soft">Tükendi</span>
                      <Toggle
                        checked={product.isSoldOut}
                        onChange={(next) => handleToggle(product, 'isSoldOut', next)}
                        label={`${product.name} tükendi`}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-ink-soft">Menüde</span>
                      <Toggle
                        checked={product.isDailyMenu}
                        onChange={(next) => handleToggle(product, 'isDailyMenu', next)}
                        label={`${product.name} menüde`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <p className="py-10 text-center text-ink-soft">Henüz ürün eklenmemiş.</p>}
      </div>
    </div>
  )
}
