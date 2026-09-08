import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export default function StatCard({ label, value, icon: Icon, href }: { label: string; value: number; icon: LucideIcon; href: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-brand-50">
      <Icon className="h-5 w-5 text-brand-500" aria-hidden="true" />
      <span className="font-display text-2xl font-bold text-ink">{value}</span>
      <span className="text-xs text-ink-soft">{label}</span>
    </Link>
  )
}
