import { db } from '@/lib/db'
import type { Settings, DayHours } from '@prisma/client'

export type SettingsWithHours = Settings & { hours: DayHours[] }

export async function getSettings(): Promise<SettingsWithHours> {
  const settings = await db.settings.findUnique({
    where: { id: 'singleton' },
    include: { hours: { orderBy: [{ business: 'asc' }, { weekday: 'asc' }] } },
  })
  if (!settings) {
    throw new Error('Ayarlar bulunamadı. Seed script çalıştırıldığından emin olun.')
  }
  return settings
}
