import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMatchById } from '@/lib/queries/matches'
import MatchForm from '@/components/admin/MatchForm'

export const metadata: Metadata = { title: 'Maçı Düzenle | Egem Restaurant Menü Yönetim' }

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = await getMatchById(id)
  if (!match) notFound()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Maçı Düzenle</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {match.homeTeam} – {match.awayTeam}
      </p>
      <div className="mt-6">
        <MatchForm match={match} />
      </div>
    </div>
  )
}
