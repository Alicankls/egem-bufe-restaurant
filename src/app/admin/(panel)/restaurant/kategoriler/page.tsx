import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import CategoriesPage from '@/components/admin/CategoriesPage'

export const metadata: Metadata = { title: 'Restaurant Kategorileri | Egem Restaurant Menü Yönetim' }

export default async function RestaurantCategoriesPage() {
  const categories = await getCategories('RESTAURANT')
  return <CategoriesPage business="RESTAURANT" initialCategories={categories} />
}
