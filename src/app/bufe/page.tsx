import type { Metadata } from 'next'
import PageHero from '@/components/sections/PageHero'
import ThreeStepStrip from '@/components/sections/ThreeStepStrip'
import CategoryGrid from '@/components/sections/CategoryGrid'
import PopularStrip from '@/components/sections/PopularStrip'
import WhatsAppBox from '@/components/sections/WhatsAppBox'
import LocationHours from '@/components/sections/LocationHours'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: siteConfig.bufe.name,
  description: "Tost, sandviç, sosisli ve hamburger — Çorlu Yeni Sanayi Bölgesi'nde hızlı ve pratik lezzetler.",
  alternates: { canonical: '/bufe' },
}

export default function BufePage() {
  return (
    <div>
      <PageHero imageSlot="bufe.hero" title="EGEM Büfe" breadcrumbLabel="Büfe" />
      <ThreeStepStrip />
      <CategoryGrid />
      <PopularStrip />
      <WhatsAppBox />
      <LocationHours />
    </div>
  )
}
