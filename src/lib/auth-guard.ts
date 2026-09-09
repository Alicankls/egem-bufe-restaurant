// Server Action'lar için oturum koruması.
//
// `admin/(panel)/layout.tsx` içindeki auth() kontrolü yalnızca SAYFA render'ını
// korur; Server Action POST'ları layout'tan geçmez. Next.js dokümantasyonu
// (`use-server` — Authentication and authorization) her action'ın kendi yetki
// kontrolünü yapmasını şart koşar. Bu yüzden her mutasyon action'ı ilk satırda
// requireAdmin() çağırır.
import { auth } from '@/auth'

// Hata mesajı kasıtlı olarak geneldir: "oturum yok" ile "yetki yok" ayrımını
// sızdırmaz.
export const UNAUTHORIZED_MESSAGE = 'Bu işlemi yapma yetkiniz yok.'

/**
 * Oturum yoksa `{ error }` döner, varsa boş nesne döner.
 * Kullanım: `const guard = await requireAdmin(); if (guard.error) return guard`
 */
export async function requireAdmin(): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: UNAUTHORIZED_MESSAGE }
  }
  return {}
}
