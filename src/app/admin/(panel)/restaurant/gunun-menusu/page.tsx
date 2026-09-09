import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import DailyMenuPage from '@/components/admin/DailyMenuPage'

export const metadata: Metadata = { title: 'Günün Menüsü | Egem Restaurant Menü Yönetim' }

export default async function RestaurantDailyMenuPage() {
  const products = await getProducts('RESTAURANT')
  return <DailyMenuPage business="RESTAURANT" initialProducts={products} />
}
