import { Tv } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import { getMatches } from '@/lib/queries/matches'
import { getSettings } from '@/lib/queries/settings'
import { selectTodayMatches, selectNextMatch, formatMatchDate, formatMatchTime, DEFAULT_MATCH_IMAGE } from '@/lib/matches'
import type { Match } from '@prisma/client'

function OtherMatchRow({ match }: { match: Match }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-t border-white/10 py-3 first:border-t-0">
      <p className="min-w-0 truncate text-[15px] font-semibold text-white">
        {match.homeTeam} <span className="font-normal text-white/50">–</span> {match.awayTeam}
      </p>
      <span className="shrink-0 text-sm text-white/60">{formatMatchTime(match.kickoffAt)}</span>
    </div>
  )
}

export default async function Matches() {
  const [all, settings] = await Promise.all([getMatches(), getSettings()])
  const { primary, others } = selectTodayMatches(all)
  const next = primary ? null : selectNextMatch(all)
  const noMatchMessage = settings.noMatchMessage?.trim()

  return (
    <Section tone="brand-950" className="mb-12 lg:mb-20">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col items-start gap-4 text-left">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">CANLI YAYIN</span>
          <h2 className="font-display text-[26px] font-extrabold leading-[1.2] text-white lg:text-[44px]">Maçlar EGEM&apos;de izlenir</h2>
          <p className="max-w-[50ch] text-[17px] leading-[1.65] text-white/75">
            Büyük ekranda, buz gibi içeceğiniz ve çeşitli aperatiflerle maç keyfi. Günün maçını kaçırmayın.
          </p>
          <Button href="/menu?tab=bufe" className="mt-2">
            Menüye Göz At
          </Button>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
          {primary ? (
            <>
              <div className="w-full bg-black/40">
                {/* Görsel kırpılmadan, kendi oranıyla tam gösterilir; çok uzun afişler ekran yüksekliğiyle sınırlanır. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={primary.imageUrl || DEFAULT_MATCH_IMAGE} alt="" className="mx-auto block h-auto max-h-[70vh] w-full object-contain" />
              </div>
              <div className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-bold text-ink">BUGÜN</span>
                  <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                    {primary.competition}
                  </span>
                </div>
                <p className="truncate text-[19px] font-bold text-white">
                  {primary.homeTeam} <span className="font-normal text-white/50">–</span> {primary.awayTeam}
                </p>
                <p className="text-sm text-white/70">
                  {formatMatchDate(primary.kickoffAt)} · {formatMatchTime(primary.kickoffAt)}
                </p>
                {primary.note && <p className="text-sm text-white/60">{primary.note}</p>}
              </div>
              {others.length > 0 && (
                <div className="border-t border-white/10 px-5 pb-4">
                  {others.map((m) => (
                    <OtherMatchRow key={m.id} match={m} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <Tv className="h-8 w-8 text-white/40" aria-hidden="true" />
              <p className="text-[17px] font-bold text-white">Bugün maç yok</p>
              {noMatchMessage ? (
                <p className="text-[15px] text-white/70">{noMatchMessage}</p>
              ) : next ? (
                <p className="text-[15px] text-white/70">
                  Sıradaki maç: {formatMatchDate(next.kickoffAt)}, {formatMatchTime(next.kickoffAt)} – {next.homeTeam} – {next.awayTeam}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
