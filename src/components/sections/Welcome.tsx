import SmartImage from '@/components/ui/SmartImage'
import Container from '@/components/ui/Container'

export default function Welcome() {
  return (
    <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-24">
      <div className="flex gap-4">
        <SmartImage slot="home.welcome.1" className="w-3/5 rounded-lg" />
        <SmartImage slot="home.welcome.2" className="w-2/5 rounded-lg lg:-mt-10" />
      </div>
      <div className="flex flex-col items-start gap-4 text-left">
        <svg width="48" height="16" viewBox="0 0 48 16" fill="none" aria-hidden="true" className="text-accent-500">
          <path d="M0 8H16M32 8H48M24 2L24 14" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">Hoş Geldiniz</span>
        <h2 className="font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">EGEM&apos;e Hoş Geldiniz</h2>
        <p className="max-w-[60ch] text-[17px] leading-[1.65] text-ink-soft">
          EGEM-TRAK Restaurant ve EGEM Büfe, Çorlu Yeni Sanayi Bölgesi&apos;nde tek çatı altında iki farklı ihtiyaca cevap
          veriyor. Restaurant tarafında her gün taze pişen ev yemekleri, büfe tarafında ise hızlı ve pratik lezzetler sizi
          bekliyor.
        </p>
        <p className="max-w-[60ch] text-[17px] leading-[1.65] text-ink-soft">
          Sanayi bölgesinin temposunu bilen bir ekip olarak, hem doyurucu bir öğle molası hem de aceleniz olduğunda hızlı
          bir seçenek sunmak için buradayız.
        </p>
        <div className="mt-2 h-px w-16 bg-line" />
      </div>
    </Container>
  )
}
