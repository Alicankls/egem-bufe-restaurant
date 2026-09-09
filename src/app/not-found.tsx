import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import PublicChrome from '@/components/layout/PublicChrome'

// Bu dosya kasıtlı olarak `(public)` grubunun DIŞINDA, `src/app/` kökünde durur:
// Next.js dokümantasyonuna göre eşleşmeyen tüm URL'leri yalnızca KÖK
// `app/not-found` yakalar (bkz. next/dist/docs/01-app/03-api-reference/
// 03-file-conventions/not-found.md — "the root app/not-found.js ... handle any
// unmatched URLs for your whole application"). Grup layout'u uygulanmadığı için
// site çerçevesini burada doğrudan PublicChrome ile sarıyoruz.
export default function NotFound() {
  return (
    <PublicChrome>
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-24 text-center">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">404</span>
        <h1 className="font-display text-3xl font-extrabold text-ink">Sayfa bulunamadı</h1>
        <p className="max-w-md text-ink-soft">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
        <Button href="/">Anasayfaya Dön</Button>
      </Container>
    </PublicChrome>
  )
}
