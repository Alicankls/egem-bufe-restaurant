import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import CategoriesPage from '@/components/admin/CategoriesPage'

export const metadata: Metadata = { title: 'Büfe Kategorileri | Egem Restaurant Menü Yönetim' }

export default async function BufeCategoriesPage() {
  const categories = await getCategories('BUFE')
  return <CategoriesPage business="BUFE" initialCategories={categories} />
}
