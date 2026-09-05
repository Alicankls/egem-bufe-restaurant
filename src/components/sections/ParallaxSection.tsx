import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import SmartImage from '@/components/ui/SmartImage'

export default function ParallaxSection() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden">
      <SmartImage slot="home.parallax" absolute className="inset-0" dark />
      <div className="absolute inset-0 bg-brand-950/60" />
      <Container className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center text-white">
        <h2 className="font-display text-[26px] font-extrabold leading-[1.2] lg:text-[44px]">
          <span className="font-normal">Yıllardır aynı</span> özenle
        </h2>
        <p className="max-w-md text-[17px] leading-[1.65] text-white/85">
          Sanayi bölgesinin gündelik temposuna, güvenilir ve tutarlı bir lezzet anlayışıyla eşlik ediyoruz.
        </p>
        <Button href="/hakkimizda" variant="outline-light">
          Hakkımızda
        </Button>
      </Container>
    </div>
  )
}
