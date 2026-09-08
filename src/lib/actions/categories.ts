'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateUniqueSlug } from '@/lib/queries/categories'
import type { Business } from '@prisma/client'

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Kategori adı zorunludur.').max(80, 'Kategori adı çok uzun.'),
})

export async function createCategory(business: Business, formData: FormData): Promise<{ error?: string }> {
  const parsed = categorySchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const slug = await generateUniqueSlug(business, parsed.data.name)
  const maxSort = await db.category.aggregate({ where: { business }, _max: { sortOrder: true } })

  await db.category.create({
    data: {
      business,
      name: parsed.data.name,
      slug,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  })

  revalidatePath(business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error?: string }> {
  const parsed = categorySchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const category = await db.category.findUnique({ where: { id } })
  if (!category) return { error: 'Kategori bulunamadı.' }

  const slug = await generateUniqueSlug(category.business, parsed.data.name, id)
  await db.category.update({ where: { id }, data: { name: parsed.data.name, slug } })

  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const category = await db.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })
  if (!category) return { error: 'Kategori bulunamadı.' }
  if (category._count.products > 0) {
    return { error: 'Bu kategoride ürünler var. Önce ürünleri taşıyın veya silin.' }
  }

  await db.category.delete({ where: { id } })
  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function toggleCategoryActive(id: string, isActive: boolean): Promise<{ error?: string }> {
  const category = await db.category.update({ where: { id }, data: { isActive } })
  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function moveCategory(id: string, direction: 'up' | 'down'): Promise<{ error?: string }> {
  const category = await db.category.findUnique({ where: { id } })
  if (!category) return { error: 'Kategori bulunamadı.' }

  const neighbor = await db.category.findFirst({
    where: {
      business: category.business,
      sortOrder: direction === 'up' ? { lt: category.sortOrder } : { gt: category.sortOrder },
    },
    orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
  })
  if (!neighbor) return {}

  await db.$transaction([
    db.category.update({ where: { id: category.id }, data: { sortOrder: neighbor.sortOrder } }),
    db.category.update({ where: { id: neighbor.id }, data: { sortOrder: category.sortOrder } }),
  ])

  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}
