import type { Metadata } from 'next'

// Admin sayfaları halka açık site metadata'sını (marka başlığı, OG görseli)
// devralmamalı ve indekslenmemelidir.
export const metadata: Metadata = {
  title: 'Giriş | Egem Restaurant Menü Yönetim',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
