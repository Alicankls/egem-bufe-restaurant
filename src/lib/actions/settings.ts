'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'

const settingsSchema = z.object({
  brandName: z.string().trim().min(1, 'Marka adı zorunludur.'),
  tagline: z.string().trim().optional().or(z.literal('')),
  aboutText: z.string().trim().optional().or(z.literal('')),
  restaurantName: z.string().trim().min(1, 'Restaurant adı zorunludur.'),
  restaurantPhone: z.string().trim().optional().or(z.literal('')),
  restaurantWhatsapp: z.string().trim().optional().or(z.literal('')),
  bufeName: z.string().trim().min(1, 'Büfe adı zorunludur.'),
  bufePhone: z.string().trim().optional().or(z.literal('')),
  bufeWhatsapp: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  mapEmbedUrl: z.string().trim().optional().or(z.literal('')),
  directionsUrl: z.string().trim().optional().or(z.literal('')),
  instagram: z.string().trim().url('Geçerli bir URL girin.').optional().or(z.literal('')),
  facebook: z.string().trim().url('Geçerli bir URL girin.').optional().or(z.literal('')),
  youtube: z.string().trim().url('Geçerli bir URL girin.').optional().or(z.literal('')),
  showPrices: z.coerce.boolean(),
  themeColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Geçerli bir renk kodu girin.'),
})

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const
const BUSINESSES = ['RESTAURANT', 'BUFE'] as const

export async function updateSettings(formData: FormData): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = settingsSchema.safeParse({ ...raw, showPrices: raw.showPrices === 'on' })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  await db.settings.update({ where: { id: 'singleton' }, data: parsed.data })

  const hourUpdates: Promise<unknown>[] = []
  for (const business of BUSINESSES) {
    for (const weekday of WEEKDAYS) {
      const prefix = `hours.${business}.${weekday}`
      const isClosed = formData.get(`${prefix}.isClosed`) === 'on'
      const openTime = formData.get(`${prefix}.openTime`)
      const closeTime = formData.get(`${prefix}.closeTime`)

      hourUpdates.push(
        db.dayHours.updateMany({
          where: { settingsId: 'singleton', business, weekday },
          data: {
            isClosed,
            openTime: isClosed ? null : typeof openTime === 'string' && openTime ? openTime : null,
            closeTime: isClosed ? null : typeof closeTime === 'string' && closeTime ? closeTime : null,
          },
        })
      )
    }
  }
  await Promise.all(hourUpdates)

  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
  return {}
}
