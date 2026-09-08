import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'
import type { Business, Category } from '@prisma/client'

export type CategoryWithCount = Category & { _count: { products: number } }

export async function getCategories(business: Business): Promise<CategoryWithCount[]> {
  return db.category.findMany({
    where: { business },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })
}

export async function generateUniqueSlug(business: Business, name: string, excludeId?: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let suffix = 2

  while (true) {
    const existing = await db.category.findFirst({
      where: {
        business,
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
    if (!existing) return slug
    slug = `${base}-${suffix}`
    suffix += 1
  }
}
