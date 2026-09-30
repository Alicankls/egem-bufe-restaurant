import { db } from '@/lib/db'
import type { Match } from '@prisma/client'

// isPublished/zaman filtresi çağıran taraf uygular (bkz. `@/lib/matches`
// selectHomeMatches) — admin bu listenin tamamını (gizli + geçmiş dahil) görmesi
// gerektiği için tek bir sorgu yeterli.
export async function getMatches(): Promise<Match[]> {
  return db.match.findMany({ orderBy: { kickoffAt: 'asc' } })
}

export async function getMatchById(id: string): Promise<Match | null> {
  return db.match.findUnique({ where: { id } })
}
