import { revalidatePath } from 'next/cache'
import type { Business } from '@prisma/client'

/**
 * Bir işletmenin verisi değiştiğinde etkilenen TÜM admin rotalarını yeniden
 * doğrular. Kategori/ürün mutasyonları sayfalar arası bağımlıdır:
 * - `kategoriler` ↔ `urunler` (kategori filtresi açılır menüsü)
 * - `urunler` ↔ `gunun-menusu` (isDailyMenu toggle'ı her iki sayfadan da yapılır)
 * - `dashboard` (istatistik sayacı; URL'de işletmeye göre bölünmez, tek yoldur)
 */
export function revalidateAdminPaths(business: Business) {
  const segment = business === 'RESTAURANT' ? 'restaurant' : 'bufe'
  revalidatePath(`/admin/${segment}/kategoriler`)
  revalidatePath(`/admin/${segment}/urunler`)
  revalidatePath(`/admin/${segment}/gunun-menusu`)
  revalidatePath('/admin/dashboard')

  // Public menü sayfaları artık aynı Product/Category tablolarını okuyor —
  // admin'de kaydedince (görsel dahil) sitede de anında görünsün diye bu
  // sayfaları da yeniden doğrula. `/menu` zaten dinamik (her istekte taze),
  // ama diğerleri statik/ISR olduğundan burada olmadan bayat kalırlardı.
  revalidatePath('/')
  revalidatePath('/menu')
  revalidatePath(`/${segment}`)
}

/** Maç yayınları admin listesi + anasayfa (Maçlar bölümü) için yeniden doğrulama. */
export function revalidateMatchPaths() {
  revalidatePath('/admin/maclar')
  revalidatePath('/')
}
