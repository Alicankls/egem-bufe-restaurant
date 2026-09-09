import { db } from '@/lib/db'
import type { Business, Product, Category } from '@prisma/client'

// `price` alanı Prisma'da `Decimal` — Server Component'ten Client Component'e
// prop olarak geçemez ("Only plain objects can be passed to Client Components
// ... Decimal objects are not supported"). Bu yüzden burada `number`'a
// dönüştürülüp öyle döndürülür; sadece canlı bir veritabanına karşı
// çalıştırıldığında ortaya çıkan bir hatadır.
export type ProductWithCategory = Omit<Product, 'price'> & { price: number; category: Category }

function toPlainProduct<T extends { price: unknown }>(product: T): Omit<T, 'price'> & { price: number } {
  return { ...product, price: Number(product.price) }
}

export async function getProducts(
  business: Business,
  opts?: { search?: string; categoryId?: string }
): Promise<ProductWithCategory[]> {
  const products = await db.product.findMany({
    where: {
      business,
      ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts?.search ? { name: { contains: opts.search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    include: { category: true },
  })
  return products.map(toPlainProduct)
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const product = await db.product.findUnique({ where: { id }, include: { category: true } })
  return product ? toPlainProduct(product) : null
}
