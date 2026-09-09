'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { revalidateAdminPaths } from '@/lib/revalidate-admin'
import type { Business } from '@prisma/client'

const productSchema = z.object({
  name: z.string().trim().min(1, 'Ürün adı zorunludur.').max(120, 'Ürün adı çok uzun.'),
  code: z.string().trim().max(20, 'Ürün kodu çok uzun.').optional().or(z.literal('')),
  price: z.coerce.number({ message: 'Fiyat sayı olmalıdır.' }).positive('Fiyat 0\'dan büyük olmalıdır.'),
  calories: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().nonnegative().optional()
  ),
  shortDescription: z.string().trim().max(160, 'Kısa açıklama çok uzun.').optional().or(z.literal('')),
  longDescription: z.string().trim().max(1000, 'Uzun açıklama çok uzun.').optional().or(z.literal('')),
  allergens: z.string().trim().max(300, 'Alerjen bilgisi çok uzun.').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Kategori seçilmelidir.'),
  imageUrl: z.string().trim().optional().or(z.literal('')),
  isActive: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
  isSoldOut: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  isDailyMenu: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  sortOrder: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().nonnegative().optional()
  ),
})

// Server Action'lar TypeScript tiplerinden bağımsız olarak çalışma zamanında
// çağrılabilir; toggleProductField'ın alan adı doğrudan Prisma `data` nesnesine
// yazıldığı için literal kümesi çalışma zamanında da doğrulanmalıdır.
const toggleFieldSchema = z.enum(['isSoldOut', 'isDailyMenu', 'isActive'])
const toggleValueSchema = z.boolean({ message: 'Geçersiz değer.' })

export async function createProduct(business: Business, formData: FormData): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const parsed = productSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } })
  if (!category || category.business !== business) {
    return { error: 'Kategori bu işletmeye ait değil.' }
  }

  let sortOrder = parsed.data.sortOrder
  if (sortOrder === undefined) {
    const maxSort = await db.product.aggregate({
      where: { categoryId: parsed.data.categoryId },
      _max: { sortOrder: true },
    })
    sortOrder = (maxSort._max.sortOrder ?? -1) + 1
  }

  await db.product.create({
    data: {
      business,
      name: parsed.data.name,
      code: parsed.data.code || null,
      price: parsed.data.price,
      calories: parsed.data.calories ?? null,
      shortDescription: parsed.data.shortDescription || null,
      longDescription: parsed.data.longDescription || null,
      allergens: parsed.data.allergens || null,
      imageUrl: parsed.data.imageUrl || null,
      categoryId: parsed.data.categoryId,
      isActive: parsed.data.isActive,
      isSoldOut: parsed.data.isSoldOut,
      isDailyMenu: parsed.data.isDailyMenu,
      sortOrder,
    },
  })

  revalidateAdminPaths(business)
  return {}
}

export async function updateProduct(id: string, formData: FormData): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const parsed = productSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return { error: 'Ürün bulunamadı.' }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } })
  if (!category || category.business !== existing.business) {
    return { error: 'Kategori bu işletmeye ait değil.' }
  }

  await db.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      code: parsed.data.code || null,
      price: parsed.data.price,
      calories: parsed.data.calories ?? null,
      shortDescription: parsed.data.shortDescription || null,
      longDescription: parsed.data.longDescription || null,
      allergens: parsed.data.allergens || null,
      imageUrl: parsed.data.imageUrl || null,
      categoryId: parsed.data.categoryId,
      isActive: parsed.data.isActive,
      isSoldOut: parsed.data.isSoldOut,
      isDailyMenu: parsed.data.isDailyMenu,
      sortOrder: parsed.data.sortOrder ?? existing.sortOrder,
    },
  })

  revalidateAdminPaths(existing.business)
  return {}
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return { error: 'Ürün bulunamadı.' }

  await db.product.delete({ where: { id } })
  revalidateAdminPaths(existing.business)
  return {}
}

export async function toggleProductField(
  id: string,
  field: 'isSoldOut' | 'isDailyMenu' | 'isActive',
  value: boolean
): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const parsedField = toggleFieldSchema.safeParse(field)
  const parsedValue = toggleValueSchema.safeParse(value)
  if (!parsedField.success || !parsedValue.success) {
    return { error: 'Geçersiz değer.' }
  }

  const existing = await db.product.update({
    where: { id },
    data: { [parsedField.data]: parsedValue.data },
  })
  revalidateAdminPaths(existing.business)
  return {}
}
