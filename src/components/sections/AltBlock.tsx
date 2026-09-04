import SmartImage from '@/components/ui/SmartImage'
import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

type AltBlockProps = {
  reverse?: boolean
  kicker: string
  title: string
  text: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  imageSlotTop: string
  imageSlotBottom: string
}

export default function AltBlock({ reverse = false, kicker, title, text, primaryCta, secondaryCta, imageSlotTop, imageSlotBottom }: AltBlockProps) {
  return (
    <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-16">
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="flex gap-4">
          <SmartImage slot={imageSlotTop} className="w-3/5 rounded-lg" />
          <SmartImage slot={imageSlotBottom} className="w-2/5 rounded-lg lg:-mt-10" />
        </div>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">{kicker}</span>
        <h2 className="mt-3 font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">{title}</h2>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-[1.65] text-ink-soft">{text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
          <Button href={secondaryCta.href} variant="outline">
            {secondaryCta.label}
          </Button>
        </div>
      </div>
    </Container>
  )
}
