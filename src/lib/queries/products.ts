import { db } from '@/lib/db'
import type { Business, Product, Category } from '@prisma/client'

export type ProductWithCategory = Product & { category: Category }

export async function getProducts(
  business: Business,
  opts?: { search?: string; categoryId?: string }
): Promise<ProductWithCategory[]> {
  return db.product.findMany({
    where: {
      business,
      ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts?.search ? { name: { contains: opts.search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    include: { category: true },
  })
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  return db.product.findUnique({ where: { id }, include: { category: true } })
}
