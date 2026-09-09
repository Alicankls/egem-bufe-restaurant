'use server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/auth-guard'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { error: 'Dosya bulunamadı.' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Yalnızca JPEG, PNG veya WEBP dosyaları desteklenir.' }
  }
  if (file.size > MAX_SIZE) {
    return { error: 'Dosya boyutu 5 MB\'ı geçemez.' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const resized = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    const blob = await put(filename, resized, { access: 'public', contentType: 'image/webp' })

    return { url: blob.url }
  } catch {
    return { error: 'Görsel işlenirken bir hata oluştu.' }
  }
}
