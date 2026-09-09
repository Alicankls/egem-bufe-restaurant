import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import DailyMenuPage from '@/components/admin/DailyMenuPage'

export const metadata: Metadata = { title: 'Günün Menüsü | Egem Büfe Menü Yönetim' }

export default async function BufeDailyMenuPage() {
  const products = await getProducts('BUFE')
  return <DailyMenuPage business="BUFE" initialProducts={products} />
}
