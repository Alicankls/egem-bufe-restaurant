'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import Toggle from './Toggle'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  moveCategory,
} from '@/lib/actions/categories'
import type { CategoryWithCount } from '@/lib/queries/categories'
import type { Business } from '@prisma/client'

export default function CategoriesPage({
  business,
  initialCategories,
}: {
  business: Business
  initialCategories: CategoryWithCount[]
}) {
  // `categories` iyimser (optimistic) güncellemeler için yerel state'te tutulur.
  const [categories, setCategories] = useState(initialCategories)
  const [syncedCategories, setSyncedCategories] = useState(initialCategories)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null)
  const [formError, setFormError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Sunucu verisi her yenilendiğinde (revalidatePath + router.refresh() sonrası
  // gelen yeni `initialCategories` prop'u) yerel state'i sıfırla. Aksi halde
  // useState ilk değeri "dondurur" ve ekleme/yeniden adlandırma/sıralama
  // işlemlerinden sonra tablo bayat veri gösterir (yalnızca silme/aktiflik
  // toggle'ı yerel olarak güncellendiği için onlar doğru görünürdü).
  // Bkz. React "Adjusting state when a prop changes" deseni.
  if (initialCategories !== syncedCategories) {
    setSyncedCategories(initialCategories)
    setCategories(initialCategories)
  }

  function closeModal() {
    setModalMode(null)
    setEditingCategory(null)
    setFormError(undefined)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, formData)
        : await createCategory(business, formData)

      if (result.error) {
        setFormError(result.error)
        return
      }
      toast.success(editingCategory ? 'Kategori güncellendi.' : 'Kategori eklendi.')
      closeModal()
      // Server Action zaten revalidatePath çağırıyor; router.refresh() sayfayı
      // yeniden yüklemeden güncel sunucu verisini getirir, böylece toast
      // görünür kalır.
      router.refresh()
    })
  }

  function handleDelete() {
    if (!deletingCategory) return
    startTransition(async () => {
      const result = await deleteCategory(deletingCategory.id)
      if (result.error) {
        toast.error(result.error)
        setDeletingCategory(null)
        return
      }
      toast.success('Kategori silindi.')
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id))
      setDeletingCategory(null)
    })
  }

  function handleToggle(category: CategoryWithCount, next: boolean) {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, isActive: next } : c)))
    startTransition(async () => {
      const result = await toggleCategoryActive(category.id, next)
      if (result.error) {
        toast.error(result.error)
        setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, isActive: !next } : c)))
      }
    })
  }

  function handleMove(category: CategoryWithCount, direction: 'up' | 'down') {
    const index = categories.findIndex((c) => c.id === category.id)
    const target = direction === 'up' ? index - 1 : index + 1
    if (index === -1 || target < 0 || target >= categories.length) return

    // Anında geri bildirim için satırları yerel olarak yer değiştir; sunucu
    // yanıtı geldiğinde prop senkronizasyonu gerçek sıralamayı uygular.
    const previous = categories
    const swapped = [...categories]
    ;[swapped[index], swapped[target]] = [swapped[target], swapped[index]]
    setCategories(swapped)

    startTransition(async () => {
      const result = await moveCategory(category.id, direction)
      if (result.error) {
        toast.error(result.error)
        setCategories(previous)
        return
      }
      router.refresh()
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Kategoriler</h1>
          <p className="mt-1 text-sm text-ink-soft">Menü kategorilerini yönetin, sıralayın ve aktif/pasif yapın.</p>
        </div>
        <button
          onClick={() => setModalMode('create')}
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Kategori Ekle
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Ürün Sayısı</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMove(category, 'up')}
                      disabled={index === 0 || isPending}
                      aria-label="Yukarı taşı"
                      className="flex h-11 w-11 items-center justify-center rounded text-ink-soft disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleMove(category, 'down')}
                      disabled={index === categories.length - 1 || isPending}
                      aria-label="Aşağı taşı"
                      className="flex h-11 w-11 items-center justify-center rounded text-ink-soft disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">{category.name}</td>
                <td className="px-4 py-3 text-ink-soft">{category.slug}</td>
                <td className="px-4 py-3 text-ink-soft">{category._count.products}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={category.isActive}
                      onChange={(next) => handleToggle(category, next)}
                      label={`${category.name} durumu`}
                    />
                    <span className="text-xs text-ink-soft">{category.isActive ? 'Aktif' : 'Pasif'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setModalMode('edit')
                      }}
                      aria-label={`${category.name} düzenle`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(category)}
                      aria-label={`${category.name} sil`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Henüz kategori eklenmemiş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalMode !== null} title={editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'} onClose={closeModal}>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {editingCategory && <p className="text-sm text-ink-soft">{editingCategory.name} kategorisini düzenliyorsunuz.</p>}
          {!editingCategory && <p className="text-sm text-ink-soft">Menüde görünecek yeni bir kategori oluşturun.</p>}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
              Kategori Adı
            </label>
            <input
              id="name"
              name="name"
              defaultValue={editingCategory?.name ?? ''}
              placeholder="Örn: Günün Çorbaları"
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
            {formError && <p className="mt-1 text-xs text-red-600">{formError}</p>}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] w-full rounded-lg bg-brand-500 text-sm font-semibold text-white disabled:opacity-60"
          >
            {editingCategory ? 'Güncelle' : 'Ekle'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={deletingCategory !== null}
        title="Kategoriyi Sil"
        description={`"${deletingCategory?.name}" silinecek. Emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  )
}
