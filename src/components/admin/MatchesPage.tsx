'use client'
import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from './ConfirmDialog'
import NoMatchMessageForm from './NoMatchMessageForm'
import { deleteMatch, deletePastMatches } from '@/lib/actions/matches'
import { isPast, isToday, formatMatchDate, formatMatchTime } from '@/lib/matches'
import type { Match } from '@prisma/client'

function StatusBadges({ match, now }: { match: Match; now: Date }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {isToday(match.kickoffAt, now) && !isPast(match.kickoffAt, now) && (
        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">BUGÜN</span>
      )}
      {match.isFeatured && (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-semibold text-accent-500">
          <Star className="h-3 w-3" aria-hidden="true" />
          Öne Çıkan
        </span>
      )}
      {!match.isPublished && (
        <span className="inline-flex rounded-full bg-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft">Gizli</span>
      )}
    </div>
  )
}

function MatchTable({
  matches,
  now,
  emptyLabel,
  onDelete,
}: {
  matches: Match[]
  now: Date
  emptyLabel: string
  onDelete: (match: Match) => void
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <th className="px-4 py-3">Tarih</th>
            <th className="px-4 py-3">Saat</th>
            <th className="px-4 py-3">Maç</th>
            <th className="px-4 py-3">Lig/Turnuva</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 text-ink-soft">{formatMatchDate(match.kickoffAt)}</td>
              <td className="px-4 py-3 text-ink-soft">{formatMatchTime(match.kickoffAt)}</td>
              <td className="px-4 py-3 font-semibold text-ink">
                {match.homeTeam} – {match.awayTeam}
                {match.note && <p className="mt-0.5 text-xs font-normal text-ink-soft">{match.note}</p>}
              </td>
              <td className="px-4 py-3 text-ink-soft">{match.competition}</td>
              <td className="px-4 py-3">
                <StatusBadges match={match} now={now} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/maclar/${match.id}`}
                    aria-label={`${match.homeTeam} - ${match.awayTeam} maçını düzenle`}
                    className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => onDelete(match)}
                    aria-label={`${match.homeTeam} - ${match.awayTeam} maçını sil`}
                    className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {matches.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function MatchesPage({
  initialMatches,
  initialNoMatchMessage,
}: {
  initialMatches: Match[]
  initialNoMatchMessage: string
}) {
  const [matches, setMatches] = useState(initialMatches)
  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null)
  const [clearingPast, setClearingPast] = useState(false)
  const [, startTransition] = useTransition()
  // Liste render'ı boyunca sabit "şu an" — ara sırada yeniden hesaplanıp
  // satırların BUGÜN rozetini kayması engellenir.
  const [now] = useState(() => new Date())

  const { upcoming, past } = useMemo(() => {
    const sorted = [...matches].sort((a, b) => a.kickoffAt.getTime() - b.kickoffAt.getTime())
    return {
      upcoming: sorted.filter((m) => !isPast(m.kickoffAt, now)),
      past: sorted.filter((m) => isPast(m.kickoffAt, now)).reverse(),
    }
  }, [matches, now])

  function handleDelete() {
    if (!deletingMatch) return
    startTransition(async () => {
      const result = await deleteMatch(deletingMatch.id)
      if (result.error) {
        toast.error(result.error)
        setDeletingMatch(null)
        return
      }
      toast.success('Maç silindi.')
      setMatches((prev) => prev.filter((m) => m.id !== deletingMatch.id))
      setDeletingMatch(null)
    })
  }

  function handleClearPast() {
    startTransition(async () => {
      const result = await deletePastMatches()
      if (result.error) {
        toast.error(result.error)
        setClearingPast(false)
        return
      }
      toast.success(`${result.count ?? 0} geçmiş maç silindi.`)
      setMatches((prev) => prev.filter((m) => !isPast(m.kickoffAt, now)))
      setClearingPast(false)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Maç Yayınları</h1>
          <p className="mt-1 text-sm text-ink-soft">Anasayfadaki &quot;Maçlar EGEM&apos;de&quot; bölümünü buradan yönetin.</p>
        </div>
        <Link
          href="/admin/maclar/yeni"
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Maç Ekle
        </Link>
      </div>

      <div className="mt-8">
        <NoMatchMessageForm initialMessage={initialNoMatchMessage} />
      </div>

      <h2 className="font-display text-lg font-bold text-ink">Yaklaşan Maçlar</h2>
      <MatchTable matches={upcoming} now={now} emptyLabel="Yaklaşan maç yok." onDelete={setDeletingMatch} />

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Geçmiş Maçlar</h2>
        {past.length > 0 && (
          <button
            onClick={() => setClearingPast(true)}
            className="min-h-[44px] rounded-lg border border-line px-4 text-sm font-semibold text-ink-soft hover:text-red-600"
          >
            Geçmiş Maçları Temizle
          </button>
        )}
      </div>
      <MatchTable matches={past} now={now} emptyLabel="Geçmiş maç yok." onDelete={setDeletingMatch} />

      <ConfirmDialog
        open={deletingMatch !== null}
        title="Maçı Sil"
        description={`"${deletingMatch?.homeTeam} – ${deletingMatch?.awayTeam}" silinecek. Emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingMatch(null)}
      />
      <ConfirmDialog
        open={clearingPast}
        title="Geçmiş Maçları Temizle"
        description={`${past.length} geçmiş maçın tamamı silinecek. Emin misiniz?`}
        confirmLabel="Temizle"
        onConfirm={handleClearPast}
        onCancel={() => setClearingPast(false)}
      />
    </div>
  )
}
