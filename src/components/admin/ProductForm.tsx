'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import Toggle from './Toggle'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { uploadProductImage } from '@/lib/actions/upload'
import type { CategoryWithCount } from '@/lib/queries/categories'
import type { ProductWithCategory } from '@/lib/queries/products'
import type { Business } from '@prisma/client'

export default function ProductForm({
  business,
  categories,
  product,
}: {
  business: Business
  categories: CategoryWithCount[]
  product?: ProductWithCategory
}) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [isSoldOut, setIsSoldOut] = useState(product?.isSoldOut ?? false)
  const [isDailyMenu, setIsDailyMenu] = useState(product?.isDailyMenu ?? false)
  const [isPending, startTransition] = useTransition()

  const basePath = business === 'RESTAURANT' ? '/admin/restaurant' : '/admin/bufe'

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadProductImage(formData)
    setUploading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setImageUrl(result.url ?? '')
  }

  function handleSubmit(formData: FormData) {
    formData.set('imageUrl', imageUrl)
    formData.set('isActive', String(isActive))
    formData.set('isSoldOut', String(isSoldOut))
    formData.set('isDailyMenu', String(isDailyMenu))
    startTransition(async () => {
      const result = product ? await updateProduct(product.id, formData) : await createProduct(business, formData)
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success(product ? 'Ürün güncellendi.' : 'Ürün eklendi.')
      router.push(`${basePath}/urunler`)
    })
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-ink">Temel Bilgiler</h2>

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            Ürün Adı *
          </label>
          <input
            id="name"
            name="name"
            defaultValue={product?.name ?? ''}
            placeholder="Örn: Mercimek Çorbası"
            required
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-ink">
            Kategori *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? ''}
            required
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          >
            <option value="" disabled>
              Seçiniz
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink">
              Ürün Kodu
            </label>
            <input
              id="code"
              name="code"
              defaultValue={product?.code ?? ''}
              placeholder="Örn: COR-001"
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-ink">
              Fiyat (₺) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product ? Number(product.price) : 0}
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="calories" className="mb-1 block text-sm font-medium text-ink">
            Kalori (kcal)
          </label>
          <input
            id="calories"
            name="calories"
            type="number"
            min="0"
            defaultValue={product?.calories ?? ''}
            placeholder="Boş bırakılabilir"
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        <div>
          <label htmlFor="shortDescription" className="mb-1 block text-sm font-medium text-ink">
            Kısa Açıklama
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            defaultValue={product?.shortDescription ?? ''}
            placeholder="Menü kartında görünecek kısa tanım"
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        <div>
          <label htmlFor="longDescription" className="mb-1 block text-sm font-medium text-ink">
            Detaylı Açıklama
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            rows={4}
            defaultValue={product?.longDescription ?? ''}
            placeholder="Ürün detay sayfasında görünecek uzun açıklama"
            className="w-full rounded-lg border border-line px-3 py-2 text-[15px]"
          />
        </div>

        <div>
          <label htmlFor="allergens" className="mb-1 block text-sm font-medium text-ink">
            Alerjen Bilgisi
          </label>
          <input
            id="allergens"
            name="allergens"
            defaultValue={product?.allergens ?? ''}
            placeholder="Örn: Gluten, süt ürünleri içerir."
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending || uploading}
            className="min-h-[44px] rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white disabled:opacity-60"
          >
            {product ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Görsel</h2>
          {imageUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Ürün görseli" className="aspect-square w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                aria-label="Görseli kaldır"
                className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line px-4 text-center">
              <UploadCloud className="h-8 w-8 text-ink-soft" aria-hidden="true" />
              <span className="text-sm font-medium text-ink">Görsel yüklemek için tıklayın</span>
              <span className="text-xs text-ink-soft">PNG, JPG veya WEBP. En fazla 5MB.</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={uploading}
                aria-label="Ürün görseli yükle"
                className="hidden"
              />
            </label>
          )}
          {uploading && <p className="text-xs text-ink-soft">Yükleniyor...</p>}
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Durum</h2>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">{isActive ? 'Aktif' : 'Pasif'}</p>
            <Toggle checked={isActive} onChange={setIsActive} label="Aktif / Pasif" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Tükendi</p>
              <p className="text-xs text-ink-soft">Menüde soluk gösterilir.</p>
            </div>
            <Toggle checked={isSoldOut} onChange={setIsSoldOut} label="Tükendi" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Günün Menüsü</p>
              <p className="text-xs text-ink-soft">Öne çıkan bölümde listelenir.</p>
            </div>
            <Toggle checked={isDailyMenu} onChange={setIsDailyMenu} label="Günün Menüsü" />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Sıralama</h2>
          <div>
            <label htmlFor="sortOrder" className="mb-1 block text-sm font-medium text-ink">
              Sıralama
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={product?.sortOrder ?? ''}
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
            <p className="mt-1 text-xs text-ink-soft">Küçük değer önce gösterilir. Boşsa en sona eklenir.</p>
          </div>
        </div>
      </div>
    </form>
  )
}
