import type { Metadata } from 'next'
import PageHero from '@/components/sections/PageHero'
import AltBlock from '@/components/sections/AltBlock'
import TodaysSpecialBlock from '@/components/sections/TodaysSpecialBlock'
import MenuPreview from '@/components/sections/MenuPreview'
import MosaicBanners from '@/components/sections/MosaicBanners'
import LocationHours from '@/components/sections/LocationHours'
import Section from '@/components/ui/Section'
import Container from '@/components/ui/Container'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import { getDailyMenuNames } from '@/lib/queries/menu-view'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: siteConfig.restaurant.name,
  description: "Çorlu Zafer Mahallesi'nde her gün taze pişen ev yemekleri. Günlük tabldot menüsünü hemen görün.",
  alternates: { canonical: '/restaurant' },
}

export default async function RestaurantPage() {
  const dailyMenuNames = await getDailyMenuNames()
  return (
    <div>
      <PageHero imageSlot="restaurant.hero" title="EGEM-TRAK Restaurant" breadcrumbLabel="Restaurant" />
      <AltBlock
        kicker="Tanıyalım"
        title="Ev yemeği tadında, her gün taze"
        text="EGEM-TRAK Restaurant, Çorlu Zafer Mahallesi'nde çalışanlara ve bölgeyi kullanan herkese sıcak, doyurucu ve güvenilir bir öğün sunar. Menümüz her gün değişir, malzemeler taze hazırlanır."
        primaryCta={{ label: 'Menü', href: '/menu?tab=restaurant' }}
        secondaryCta={{ label: 'İletişim', href: '/iletisim' }}
        imageSlotTop="restaurant.intro.1"
        imageSlotBottom="restaurant.intro.2"
      />
      <TodaysSpecialBlock items={dailyMenuNames} />
      <MenuPreview />
      <MosaicBanners />
      <Section tone="white">
        <Container className="flex flex-col items-center gap-10">
          <SectionTitle kicker="Galeri" lead="Lokantamızdan" strong="Kareler" />
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            <SmartImage slot="restaurant.gallery.1" className="rounded-lg" />
            <SmartImage slot="restaurant.gallery.2" className="rounded-lg" />
            <SmartImage slot="restaurant.gallery.3" className="rounded-lg" />
            <SmartImage slot="restaurant.gallery.4" className="rounded-lg" />
          </div>
        </Container>
      </Section>
      <LocationHours />
    </div>
  )
}
