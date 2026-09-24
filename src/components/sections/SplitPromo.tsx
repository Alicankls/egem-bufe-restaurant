import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import LoopVideo from '@/components/ui/LoopVideo'

export default function SplitPromo() {
  return (
    <Section tone="brand-50">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col items-start gap-4">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">Bugün Ne Var?</span>
          <h2 className="font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">
            Bugün tencerede
            <br />
            ne var?
          </h2>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/menu?tab=restaurant">Bugünün Menüsü</Button>
            <Button href="/restaurant" variant="outline">
              Restaurant
            </Button>
          </div>
        </div>
        <LoopVideo
          webmSrc="/videos/home/split-promo.webm"
          mp4Src="/videos/home/split-promo.mp4"
          poster="/videos/home/split-promo-poster.jpg"
          ratio="16/9"
          className="rounded-lg"
        />
      </Container>
    </Section>
  )
}
