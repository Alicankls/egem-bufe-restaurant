import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Yeni Ürün | Egem Büfe Menü Yönetim' }

export default async function NewBufeProductPage() {
  const categories = await getCategories('BUFE')
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Yeni Ürün</h1>
      <div className="mt-6">
        <ProductForm business="BUFE" categories={categories} />
      </div>
    </div>
  )
}
