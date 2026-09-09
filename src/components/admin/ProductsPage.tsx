'use client'
import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Plus, Search, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from './ConfirmDialog'
import { deleteProduct, toggleProductField } from '@/lib/actions/products'
import { formatPrice } from '@/lib/utils'
import type { ProductWithCategory } from '@/lib/queries/products'
import type { CategoryWithCount } from '@/lib/queries/categories'
import type { Business } from '@prisma/client'

const PAGE_SIZE = 20

function StatusBadge({ product }: { product: ProductWithCategory }) {
  if (product.isDailyMenu) {
    return (
      <span className="inline-flex rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white">
        Günün Menüsü
      </span>
    )
  }
  if (product.isSoldOut) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
        Tükendi
      </span>
    )
  }
  if (!product.isActive) {
    return (
      <span className="inline-flex rounded-full bg-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
        Pasif
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
      Aktif
    </span>
  )
}

export default function ProductsPage({
  business,
  initialProducts,
  initialCategories,
}: {
  business: Business
  initialProducts: ProductWithCategory[]
  initialCategories: CategoryWithCount[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deletingProduct, setDeletingProduct] = useState<ProductWithCategory | null>(null)
  const [, startTransition] = useTransition()

  const basePath = business === 'RESTAURANT' ? '/admin/restaurant' : '/admin/bufe'

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchesSearch =
        !term || p.name.toLowerCase().includes(term) || (p.code ?? '').toLowerCase().includes(term)
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  function handleDelete() {
    if (!deletingProduct) return
    startTransition(async () => {
      const result = await deleteProduct(deletingProduct.id)
      if (result.error) {
        toast.error(result.error)
        setDeletingProduct(null)
        return
      }
      toast.success('Ürün silindi.')
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
      setDeletingProduct(null)
    })
  }

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
          <h1 className="font-display text-2xl font-bold text-ink">Ürünler</h1>
          <p className="mt-1 text-sm text-ink-soft">Menüdeki tüm ürünleri buradan yönetin.</p>
        </div>
        <Link
          href={`${basePath}/urunler/yeni`}
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ürün Ekle
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Ürün ara..."
            className="min-h-[44px] w-full rounded-lg border border-line pl-10 pr-3 text-[15px]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className="min-h-[44px] rounded-lg border border-line px-3 text-[15px] sm:w-56"
        >
          <option value="">Tüm Kategoriler</option>
          {initialCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Görsel</th>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Kod</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-ink-soft">
                      <ImageOff className="h-4 w-4" aria-hidden="true" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-ink">{product.name}</td>
                <td className="px-4 py-3 text-ink-soft">{product.category.name}</td>
                <td className="px-4 py-3 text-ink-soft">{product.code || '—'}</td>
                <td className="px-4 py-3 text-ink-soft">{formatPrice(Number(product.price))}</td>
                <td className="px-4 py-3">
                  <StatusBadge product={product} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleToggle(product, 'isSoldOut', !product.isSoldOut)}
                      className="min-h-[44px] rounded-lg px-2 text-xs font-semibold text-ink-soft hover:text-ink"
                    >
                      {product.isSoldOut ? 'Satışa Aç' : 'Tükendi'}
                    </button>
                    <button
                      onClick={() => handleToggle(product, 'isDailyMenu', !product.isDailyMenu)}
                      className="min-h-[44px] rounded-lg px-2 text-xs font-semibold text-ink-soft hover:text-ink"
                    >
                      {product.isDailyMenu ? 'Menüden Çıkar' : 'Günün Menüsü'}
                    </button>
                    <Link
                      href={`${basePath}/urunler/${product.id}`}
                      aria-label={`${product.name} düzenle`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={() => setDeletingProduct(product)}
                      aria-label={`${product.name} sil`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                  Sonuç bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            Sayfa {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Önceki sayfa"
              className="flex min-h-[44px] items-center gap-1 rounded-lg border border-line px-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Önceki
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Sonraki sayfa"
              className="flex min-h-[44px] items-center gap-1 rounded-lg border border-line px-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              Sonraki
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deletingProduct !== null}
        title="Ürünü Sil"
        description={`"${deletingProduct?.name}" silinecek. Emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  )
}
