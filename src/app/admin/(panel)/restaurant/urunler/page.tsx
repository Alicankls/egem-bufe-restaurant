import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/categories'
import ProductsPage from '@/components/admin/ProductsPage'

export const metadata: Metadata = { title: 'Restaurant Ürünleri | Egem Restaurant Menü Yönetim' }

export default async function RestaurantProductsPage() {
  const [products, categories] = await Promise.all([getProducts('RESTAURANT'), getCategories('RESTAURANT')])
  return <ProductsPage business="RESTAURANT" initialProducts={products} initialCategories={categories} />
}
