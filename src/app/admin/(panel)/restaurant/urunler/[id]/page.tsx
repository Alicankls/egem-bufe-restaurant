import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories } from '@/lib/queries/categories'
import { getProductById } from '@/lib/queries/products'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Ürünü Düzenle | Egem Restaurant Menü Yönetim' }

export default async function EditRestaurantProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [categories, product] = await Promise.all([getCategories('RESTAURANT'), getProductById(id)])
  if (!product || product.business !== 'RESTAURANT') notFound()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Ürünü Düzenle</h1>
      <p className="mt-1 text-sm text-ink-soft">{product.name}</p>
      <div className="mt-6">
        <ProductForm business="RESTAURANT" categories={categories} product={product} />
      </div>
    </div>
  )
}
