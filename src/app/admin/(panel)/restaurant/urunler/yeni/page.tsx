import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Yeni Ürün | Egem Restaurant Menü Yönetim' }

export default async function NewRestaurantProductPage() {
  const categories = await getCategories('RESTAURANT')
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Yeni Ürün</h1>
      <div className="mt-6">
        <ProductForm business="RESTAURANT" categories={categories} />
      </div>
    </div>
  )
}
