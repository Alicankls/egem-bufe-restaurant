'use client'
import { useState } from 'react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import Lightbox from '@/components/ui/Lightbox'
import { imageSlots } from '@/config/images'

const gallerySlotKeys = ['home.gallery.1', 'home.gallery.2', 'home.gallery.3', 'home.gallery.4', 'home.gallery.5', 'home.gallery.6'] as const

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const images = gallerySlotKeys.map((key) => imageSlots[key])

  return (
    <Section tone="white">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Bir Bakış" lead="Mekânımızdan" strong="Kareler" />
        <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
          {gallerySlotKeys.map((key, i) => (
            <button key={key} onClick={() => setActiveIndex(i)} className="overflow-hidden rounded-lg text-left" aria-label={`${images[i].alt} - büyüt`}>
              <SmartImage slot={key} />
            </button>
          ))}
        </div>
      </Container>
      <Lightbox images={images} activeIndex={activeIndex} onClose={() => setActiveIndex(null)} onNavigate={setActiveIndex} />
    </Section>
  )
}
