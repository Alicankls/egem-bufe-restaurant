import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/config/site'
import { generateQrSvg } from '@/lib/qr'

export default async function QrBand() {
  const svg = await generateQrSvg(`${siteConfig.siteUrl}/menu`)

  return (
    <div className="bg-brand-900 py-14 text-white">
      <Container className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-2xl font-extrabold lg:text-3xl">Masanızdaki QR kodu okutun</h2>
          <p className="mt-2 text-white/80">Güncel menümüze saniyeler içinde ulaşın.</p>
          <Button href="/menu" className="mt-5">
            Menüyü Aç
          </Button>
        </div>
        {/* qrcode paketinin ürettiği SVG sabit site URL'inden sunucuda üretilir, kullanıcı girdisi içermez. */}
        <div className="h-32 w-32 shrink-0 rounded-lg bg-white p-3" dangerouslySetInnerHTML={{ __html: svg }} />
      </Container>
    </div>
  )
}
