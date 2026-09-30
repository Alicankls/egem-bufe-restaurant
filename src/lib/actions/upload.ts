'use server'
import { put, BlobError } from '@vercel/blob'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/auth-guard'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function uploadImage(formData: FormData, folder: string): Promise<{ url?: string; error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { error: 'Dosya bulunamadı.' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Desteklenmeyen format. Yalnızca JPEG, PNG veya WEBP dosyaları yüklenebilir.' }
  }
  if (file.size > MAX_SIZE) {
    return { error: "Dosya çok büyük. En fazla 5 MB yükleyebilirsiniz." }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Adım 1: görseli yeniden boyutlandır/sıkıştır (sharp). Bu adımdaki hata
  // neredeyse her zaman bozuk/desteklenmeyen bir dosya kaynaklıdır.
  let resized: Buffer
  try {
    resized = await sharp(buffer).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
  } catch (err) {
    console.error(`[upload:${folder}] sharp işleme hatası:`, err)
    return { error: 'Görsel işlenemedi. Dosya bozuk olabilir — başka bir dosyayla tekrar deneyin.' }
  }

  // Adım 2: depoya (Vercel Blob) yükle. Bu adımdaki hata genelde yapılandırma
  // (eksik/geçersiz BLOB_READ_WRITE_TOKEN) ya da ağ kaynaklıdır.
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  try {
    const blob = await put(filename, resized, { access: 'public', contentType: 'image/webp' })
    return { url: blob.url }
  } catch (err) {
    console.error(`[upload:${folder}] Vercel Blob yükleme hatası:`, err)
    if (err instanceof BlobError && err.message.includes('credentials')) {
      return { error: 'Görsel deposu yapılandırılmamış (BLOB_READ_WRITE_TOKEN eksik). Sunucu yöneticisine bildirin.' }
    }
    if (err instanceof BlobError && err.message.includes('private store')) {
      return {
        error:
          'Görsel deposu (Vercel Blob store) "private" olarak ayarlanmış, herkese açık görsellere izin vermiyor. Vercel panelinden store erişimini "public" yapın.',
      }
    }
    return { error: 'Görsel yüklenemedi, sunucuya bağlanılamadı. Lütfen tekrar deneyin.' }
  }
}

export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  return uploadImage(formData, 'products')
}

export async function uploadMatchImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  return uploadImage(formData, 'matches')
}
