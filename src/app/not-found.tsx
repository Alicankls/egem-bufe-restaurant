import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-24 text-center">
      <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">404</span>
      <h1 className="font-display text-3xl font-extrabold text-ink">Sayfa bulunamadı</h1>
      <p className="max-w-md text-ink-soft">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
      <Button href="/">Anasayfaya Dön</Button>
    </Container>
  )
}
