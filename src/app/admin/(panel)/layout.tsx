import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import AdminShell from '@/components/admin/AdminShell'

// Admin sayfaları arama motorlarına kapalıdır (robots.ts'teki /admin
// disallow kuralını tamamlar); başlıkları her sayfa kendisi belirler.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/admin/login')
  }

  return <AdminShell userEmail={session.user.email}>{children}</AdminShell>
}
