'use server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { revalidateMatchPaths } from '@/lib/revalidate-admin'
import { parseKickoff, isPast } from '@/lib/matches'

const matchSchema = z.object({
  homeTeam: z.string().trim().min(1, 'Ev sahibi takım zorunludur.').max(80, 'Ev sahibi takım adı çok uzun.'),
  awayTeam: z.string().trim().min(1, 'Deplasman takımı zorunludur.').max(80, 'Deplasman takımı adı çok uzun.'),
  competition: z.string().trim().min(1, 'Lig/turnuva zorunludur.').max(80, 'Lig/turnuva adı çok uzun.'),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih zorunludur.'),
  time: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, 'Saat zorunludur.'),
  note: z.string().trim().max(160, 'Not çok uzun.').optional().or(z.literal('')),
  imageUrl: z.string().trim().optional().or(z.literal('')),
  isFeatured: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  isPublished: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
})

function parseAndValidate(formData: FormData) {
  const parsed = matchSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' } as const
  }
  const kickoffAt = parseKickoff(parsed.data.date, parsed.data.time)
  if (Number.isNaN(kickoffAt.getTime())) {
    return { error: 'Tarih veya saat geçersiz.' } as const
  }
  return { data: parsed.data, kickoffAt } as const
}

export async function createMatch(formData: FormData): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const result = parseAndValidate(formData)
  if ('error' in result) return result

  await db.match.create({
    data: {
      homeTeam: result.data.homeTeam,
      awayTeam: result.data.awayTeam,
      competition: result.data.competition,
      kickoffAt: result.kickoffAt,
      note: result.data.note || null,
      imageUrl: result.data.imageUrl || null,
      isFeatured: result.data.isFeatured,
      isPublished: result.data.isPublished,
    },
  })

  revalidateMatchPaths()
  return {}
}

export async function updateMatch(id: string, formData: FormData): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const result = parseAndValidate(formData)
  if ('error' in result) return result

  const existing = await db.match.findUnique({ where: { id } })
  if (!existing) return { error: 'Maç bulunamadı.' }

  await db.match.update({
    where: { id },
    data: {
      homeTeam: result.data.homeTeam,
      awayTeam: result.data.awayTeam,
      competition: result.data.competition,
      kickoffAt: result.kickoffAt,
      note: result.data.note || null,
      imageUrl: result.data.imageUrl || null,
      isFeatured: result.data.isFeatured,
      isPublished: result.data.isPublished,
    },
  })

  revalidateMatchPaths()
  return {}
}

export async function deleteMatch(id: string): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const existing = await db.match.findUnique({ where: { id } })
  if (!existing) return { error: 'Maç bulunamadı.' }

  await db.match.delete({ where: { id } })
  revalidateMatchPaths()
  return {}
}

/** "Geçmiş Maçları Temizle" toplu silme — kickoff + 3 saat geçmiş tüm maçlar. */
export async function deletePastMatches(): Promise<{ error?: string; count?: number }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const all = await db.match.findMany({ select: { id: true, kickoffAt: true } })
  const now = new Date()
  const pastIds = all.filter((m) => isPast(m.kickoffAt, now)).map((m) => m.id)
  if (pastIds.length === 0) return { count: 0 }

  await db.match.deleteMany({ where: { id: { in: pastIds } } })
  revalidateMatchPaths()
  return { count: pastIds.length }
}

/** Maç Yayınları sayfasının üstündeki "bugün maç yoksa gösterilecek mesaj" — Settings.noMatchMessage. */
export async function updateNoMatchMessage(formData: FormData): Promise<{ error?: string }> {
  const guard = await requireAdmin()
  if (guard.error) return guard

  const parsed = z
    .string()
    .trim()
    .max(160, 'Mesaj çok uzun.')
    .optional()
    .or(z.literal(''))
    .safeParse(formData.get('noMatchMessage'))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  await db.settings.update({ where: { id: 'singleton' }, data: { noMatchMessage: parsed.data || null } })
  revalidateMatchPaths()
  return {}
}
