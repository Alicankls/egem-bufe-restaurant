import { db } from '@/lib/db'
import type { Business } from '@prisma/client'

export type BusinessStats = {
  totalProducts: number
  activeProducts: number
  soldOutProducts: number
  dailyMenuProducts: number
  totalCategories: number
}

export async function getBusinessStats(business: Business): Promise<BusinessStats> {
  const [totalProducts, activeProducts, soldOutProducts, dailyMenuProducts, totalCategories] = await Promise.all([
    db.product.count({ where: { business } }),
    db.product.count({ where: { business, isActive: true } }),
    db.product.count({ where: { business, isSoldOut: true } }),
    db.product.count({ where: { business, isDailyMenu: true } }),
    db.category.count({ where: { business } }),
  ])
  return { totalProducts, activeProducts, soldOutProducts, dailyMenuProducts, totalCategories }
}
