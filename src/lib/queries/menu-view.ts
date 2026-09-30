// Admin panelin yönettiği Product/Category tablolarını, public sitedeki menü
// bileşenlerinin (MenuContent, MenuItemRow, CategoryGrid, PopularStrip,
// MenuPreview...) zaten beklediği MenuCategory[]/MenuItem[] şekline çevirir.
// Bileşenler değişmez — sadece veri kaynağı statik dosyadan DB'ye taşınır.
import { db } from '@/lib/db'
import type { Business } from '@prisma/client'
import type { MenuCategory, MenuItem } from '@/data/menu'

export async function getMenuCategories(business: Business): Promise<MenuCategory[]> {
  const categories = await db.category.findMany({
    where: { business, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return categories
    .filter((c) => c.products.length > 0)
    .map((c) => ({
      key: c.slug,
      title: c.name,
      items: c.products.map(
        (p): MenuItem => ({
          name: p.name,
          desc: p.shortDescription ?? undefined,
          price: Number(p.price),
          image: p.imageUrl,
          soldOut: p.isSoldOut,
          tags: p.isDailyMenu ? ['gunun-yemegi'] : undefined,
        })
      ),
    }))
}

/** "Bugünün Tabldotu" bloğu — RESTAURANT tarafında "Günün Menüsü" işaretli, aktif ürün adları. */
export async function getDailyMenuNames(): Promise<string[]> {
  const products = await db.product.findMany({
    where: { business: 'RESTAURANT', isDailyMenu: true, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { name: true },
  })
  return products.map((p) => p.name)
}
