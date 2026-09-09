import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'
import { imageSlots } from '@/config/images'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.restaurant.name} & ${siteConfig.bufe.name}`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: 'Çorlu Yeni Sanayi Bölgesi\'nde günlük tabldot ve hızlı lezzetler. Masanızdaki QR kodu okutarak menüyü hemen görün.',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: siteConfig.brandName,
    images: imageSlots['og.default'].src
      ? [{ url: imageSlots['og.default'].src, width: 1200, height: 630, alt: imageSlots['og.default'].alt }]
      : [],
  },
}

// Kök layout yalnızca <html>/<body>, font kurulumu ve kök metadata'yı sağlar.
// Halka açık site çerçevesi (Header/Footer/MobileActionBar/ScrollTop/JSON-LD)
// `src/app/(public)/layout.tsx` içindedir; admin sayfaları kendi
// layout'larını (`admin/login/layout.tsx`, `admin/(panel)/layout.tsx`) kullanır.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
