import type { Metadata } from 'next'
import { Phone, MessageCircle, Navigation } from 'lucide-react'
import MenuTabs from '@/components/menu/MenuTabs'
import MenuContent from '@/components/menu/MenuContent'
import TodaysSpecialBlock from '@/components/sections/TodaysSpecialBlock'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { restaurantMenu } from '@/data/menu'
import { bufeMenu } from '@/data/bufe'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Menü',
  description: 'EGEM-TRAK Restaurant ve EGEM Büfe güncel menüsü — QR kodunuzu okutun, saniyeler içinde görün.',
  alternates: { canonical: '/menu' },
}

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams
  const activeTab: 'restaurant' | 'bufe' = params.tab === 'bufe' ? 'bufe' : 'restaurant'
  const categories = activeTab === 'bufe' ? bufeMenu : restaurantMenu

  return (
    <div className="pb-10 pt-16">
      <MenuTabs active={activeTab} />
      {activeTab === 'restaurant' && <TodaysSpecialBlock />}
      <MenuContent categories={categories} />
      <Container className="flex flex-col gap-4 border-t border-line py-10 text-sm text-ink-soft">
        <p>Alerjen bilgisi için lütfen personelimize danışın.</p>
        <p>
          Restaurant: {siteConfig.restaurant.phoneDisplay} · Büfe: {siteConfig.bufe.phoneDisplay}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href={`tel:${siteConfig.restaurant.phone}`}>
            <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
            Ara
          </Button>
          <Button href={siteConfig.social.whatsapp} variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            WhatsApp
          </Button>
          <Button href={siteConfig.address.directionsUrl} variant="outline">
            <Navigation className="mr-2 h-4 w-4" aria-hidden="true" />
            Yol Tarifi
          </Button>
        </div>
      </Container>
    </div>
  )
}
