import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileActionBar from '@/components/layout/MobileActionBar'
import ScrollTop from '@/components/layout/ScrollTop'
import { siteConfig } from '@/config/site'
import { getRestaurantJsonLd, getBufeJsonLd } from '@/lib/jsonld'

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
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="pb-16 font-sans text-ink antialiased lg:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getRestaurantJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBufeJsonLd()) }} />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileActionBar />
        <ScrollTop />
      </body>
    </html>
  )
}
