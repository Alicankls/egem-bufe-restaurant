import { Star } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import { reviews } from '@/data/reviews'
import { cn } from '@/lib/utils'

const avatarSlots = [
  'home.reviews.avatar.1',
  'home.reviews.avatar.2',
  'home.reviews.avatar.3',
  'home.reviews.avatar.4',
  'home.reviews.avatar.5',
  'home.reviews.avatar.6',
] as const

export default function Reviews() {
  return (
    <Section tone="brand-50">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Bizi Değerlendirin" lead="Müşterilerimiz" strong="Ne Diyor?" />
        <div className="grid w-full gap-6 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <div key={review.name} className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-full">
                  <SmartImage slot={avatarSlots[i]} sizes="44px" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{review.name}</p>
                  <p className="text-xs text-ink-soft">{review.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5" aria-label={`${review.rating} üzerinden 5 yıldız`}>
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className={cn('h-4 w-4', starIndex < review.rating ? 'text-accent-500' : 'text-line')} fill="currentColor" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm leading-[1.6] text-ink-soft">{review.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
