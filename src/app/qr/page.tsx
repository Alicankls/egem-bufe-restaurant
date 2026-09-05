import type { Metadata } from 'next'
import Container from '@/components/ui/Container'
import SmartImage from '@/components/ui/SmartImage'
import { siteConfig } from '@/config/site'
import { generateQrSvg } from '@/lib/qr'

export const metadata: Metadata = {
  title: 'QR Kod Üret',
  robots: { index: false, follow: false },
}

const cards = [
  { title: 'Genel Menü', url: '/menu', businessName: siteConfig.brandName, phone: siteConfig.restaurant.phoneDisplay },
  { title: 'Restaurant Menüsü', url: '/menu?tab=restaurant', businessName: siteConfig.restaurant.name, phone: siteConfig.restaurant.phoneDisplay },
  { title: 'Büfe Menüsü', url: '/menu?tab=bufe', businessName: siteConfig.bufe.name, phone: siteConfig.bufe.phoneDisplay },
] as const

export default async function QrPage() {
  const svgs = await Promise.all(cards.map((card) => generateQrSvg(`${siteConfig.siteUrl}${card.url}`)))

  return (
    <Container className="pb-14 pt-24">
      <div className="print:hidden">
        <h1 className="font-display text-2xl font-extrabold text-ink">QR Kod Üret ve Yazdır</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Aşağıdaki kartları yazdırıp masalara yerleştirebilirsiniz. Tarayıcının &quot;Yazdır&quot; (Ctrl/Cmd+P) özelliğini
          kullanın — yazdırma önizlemesinde yalnızca kartlar görünür, site başlığı ve alt bilgisi gizlenir. Kartlar A5
          ve A4 kağıt boyutlarıyla uyumludur.
        </p>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-1 print:gap-6">
        {cards.map((card, i) => (
          <div key={card.url} className="qr-card flex flex-col items-center gap-4 rounded-xl border border-line p-8 text-center print:border-2 print:border-ink">
            <SmartImage slot="brand.logo" className="h-10 w-32" sizes="128px" />
            <p className="font-display text-lg font-bold text-ink">Menümüz için okutun</p>
            <div className="h-40 w-40" dangerouslySetInnerHTML={{ __html: svgs[i] }} />
            <div>
              <p className="text-sm font-semibold text-ink">{card.businessName}</p>
              <p className="text-sm text-ink-soft">{card.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
