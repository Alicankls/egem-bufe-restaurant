import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import SmartImage from '@/components/ui/SmartImage'
import VideoModal from '@/components/ui/VideoModal'
import { siteConfig } from '@/config/site'

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
        <div className="relative">
          <SmartImage slot="home.split.video" className="rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoModal videoId={siteConfig.video.splitPromo} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
