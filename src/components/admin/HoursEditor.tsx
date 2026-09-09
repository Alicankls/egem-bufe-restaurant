'use client'
import type { DayHours, Business } from '@prisma/client'

const WEEKDAY_LABELS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

export default function HoursEditor({ business, hours }: { business: Business; hours: DayHours[] }) {
  const rows = [...hours].sort((a, b) => a.weekday - b.weekday)

  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((row) => (
        <HoursRow key={row.weekday} business={business} row={row} label={WEEKDAY_LABELS[row.weekday]} />
      ))}
    </div>
  )
}

function HoursRow({ business, row, label }: { business: Business; row: DayHours; label: string }) {
  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="w-28 text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <ClosedToggle name={`hours.${business}.${row.weekday}.isClosed`} defaultChecked={row.isClosed} />
        <input
          type="time"
          name={`hours.${business}.${row.weekday}.openTime`}
          defaultValue={row.openTime ?? ''}
          className="min-h-[44px] rounded-lg border border-line px-3 text-[15px]"
        />
        <span className="text-ink-soft">–</span>
        <input
          type="time"
          name={`hours.${business}.${row.weekday}.closeTime`}
          defaultValue={row.closeTime ?? ''}
          className="min-h-[44px] rounded-lg border border-line px-3 text-[15px]"
        />
      </div>
    </div>
  )
}

function ClosedToggle({ name, defaultChecked }: { name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-xs text-ink-soft">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      Kapalı
    </label>
  )
}
