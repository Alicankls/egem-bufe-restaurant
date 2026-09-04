import Container from '@/components/ui/Container'
import { todaysSpecial } from '@/data/menu'
import { formatTurkishDate } from '@/lib/utils'

export default function TodaysSpecialBlock() {
  return (
    <Container className="py-10">
      <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-6">
        <span className="rounded-full bg-accent-500 px-3 py-1 text-[11px] font-semibold text-ink">Bugünün Tabldotu</span>
        <p className="mt-3 text-sm font-medium text-ink-soft">{formatTurkishDate(new Date())}</p>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          {todaysSpecial.items.map((name) => (
            <li key={name} className="text-[17px] font-semibold text-ink">
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-soft">{todaysSpecial.note}</p>
      </div>
    </Container>
  )
}
