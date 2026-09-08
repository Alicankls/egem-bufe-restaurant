import Link from 'next/link'
import type { Metadata } from 'next'
import { Package, CheckCircle2, XCircle, CalendarCheck, Tag } from 'lucide-react'
import { getBusinessStats } from '@/lib/queries/dashboard'
import StatCard from '@/components/admin/StatCard'

export const metadata: Metadata = { title: 'Dashboard | Egem Restaurant Menü Yönetim' }

export default async function DashboardPage() {
  const [restaurantStats, bufeStats] = await Promise.all([
    getBusinessStats('RESTAURANT'),
    getBusinessStats('BUFE'),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Egem Restaurant menü yönetim panelinize hoş geldiniz.</p>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">Restaurant</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Toplam Ürün" value={restaurantStats.totalProducts} icon={Package} href="/admin/restaurant/urunler" />
          <StatCard label="Aktif Ürün" value={restaurantStats.activeProducts} icon={CheckCircle2} href="/admin/restaurant/urunler" />
          <StatCard label="Tükendi" value={restaurantStats.soldOutProducts} icon={XCircle} href="/admin/restaurant/urunler" />
          <StatCard label="Günün Menüsü" value={restaurantStats.dailyMenuProducts} icon={CalendarCheck} href="/admin/restaurant/gunun-menusu" />
          <StatCard label="Kategori" value={restaurantStats.totalCategories} icon={Tag} href="/admin/restaurant/kategoriler" />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">Büfe</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Toplam Ürün" value={bufeStats.totalProducts} icon={Package} href="/admin/bufe/urunler" />
          <StatCard label="Aktif Ürün" value={bufeStats.activeProducts} icon={CheckCircle2} href="/admin/bufe/urunler" />
          <StatCard label="Tükendi" value={bufeStats.soldOutProducts} icon={XCircle} href="/admin/bufe/urunler" />
          <StatCard label="Günün Menüsü" value={bufeStats.dailyMenuProducts} icon={CalendarCheck} href="/admin/bufe/gunun-menusu" />
          <StatCard label="Kategori" value={bufeStats.totalCategories} icon={Tag} href="/admin/bufe/kategoriler" />
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/admin/restaurant/kategoriler" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Kategori Yönet
          </Link>
          <Link href="/admin/restaurant/urunler/yeni" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Ürün Ekle
          </Link>
          <Link href="/admin/restaurant/gunun-menusu" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Günün Menüsü
          </Link>
          <Link href="/admin/settings" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Ayarlar
          </Link>
        </div>
      </section>
    </div>
  )
}
