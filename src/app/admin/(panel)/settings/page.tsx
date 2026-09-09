import type { Metadata } from 'next'
import { getSettings } from '@/lib/queries/settings'
import SettingsForm from '@/components/admin/SettingsForm'

export const metadata: Metadata = { title: 'Ayarlar | Egem Restaurant Menü Yönetim' }

export default async function SettingsPage() {
  const settings = await getSettings()
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">İşletme Ayarları</h1>
      <p className="mt-1 text-sm text-ink-soft">İşletme bilgileri, iletişim ve sosyal medya bağlantıları.</p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  )
}
