import type { Metadata } from 'next'
import { getMatches } from '@/lib/queries/matches'
import { getSettings } from '@/lib/queries/settings'
import MatchesPage from '@/components/admin/MatchesPage'

export const metadata: Metadata = { title: 'Maç Yayınları | Egem Restaurant Menü Yönetim' }

export default async function AdminMatchesPage() {
  const [matches, settings] = await Promise.all([getMatches(), getSettings()])
  return <MatchesPage initialMatches={matches} initialNoMatchMessage={settings.noMatchMessage ?? ''} />
}
