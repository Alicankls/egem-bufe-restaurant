import { ClipboardList, ChefHat, ShoppingBag } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'

const steps = [
  { icon: ClipboardList, title: 'Seç', text: 'Tost, sandviç veya sosisliden dilediğini seç.' },
  { icon: ChefHat, title: 'Hazırlansın', text: 'Siparişin dakikalar içinde hazırlanır.' },
  { icon: ShoppingBag, title: 'Al Git', text: 'Sıcacık ürününü alıp yoluna devam et.' },
] as const

export default function ThreeStepStrip() {
  return (
    <Section tone="brand-50">
      <Container className="grid gap-8 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
              <step.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="font-display text-lg font-bold text-ink">{step.title}</p>
            <p className="text-sm text-ink-soft">{step.text}</p>
          </div>
        ))}
      </Container>
    </Section>
  )
}
