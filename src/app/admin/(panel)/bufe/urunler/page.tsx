import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/categories'
import ProductsPage from '@/components/admin/ProductsPage'

export const metadata: Metadata = { title: 'Büfe Ürünleri | Egem Restaurant Menü Yönetim' }

export default async function BufeProductsPage() {
  const [products, categories] = await Promise.all([getProducts('BUFE'), getCategories('BUFE')])
  return <ProductsPage business="BUFE" initialProducts={products} initialCategories={categories} />
}
