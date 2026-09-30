import type { Metadata } from 'next'
import MatchForm from '@/components/admin/MatchForm'

export const metadata: Metadata = { title: 'Yeni Maç | Egem Restaurant Menü Yönetim' }

export default function NewMatchPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Yeni Maç</h1>
      <div className="mt-6">
        <MatchForm />
      </div>
    </div>
  )
}
