import Link from 'next/link'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import Button from '@/components/ui/Button'
import SmartImage from '@/components/ui/SmartImage'

const featuredItems = [
  { slot: 'home.featured.1', name: 'Mercimek Çorbası', category: 'Çorba', href: '/menu?tab=restaurant#corbalar' },
  { slot: 'home.featured.2', name: 'Kuru Fasulye', category: 'Sulu Yemek', href: '/menu?tab=restaurant#sulu-yemekler' },
  { slot: 'home.featured.3', name: 'Zeytinyağlı Taze Fasulye', category: 'Zeytinyağlı', href: '/menu?tab=restaurant#zeytinyaglilar' },
  { slot: 'home.featured.4', name: 'Karışık Izgara', category: 'Izgara', href: '/menu?tab=restaurant#izgara-ana-yemek' },
  { slot: 'home.featured.5', name: 'Kaşarlı Tost', category: 'Tost', href: '/menu?tab=bufe#tostlar' },
  { slot: 'home.featured.6', name: 'Sütlaç', category: 'Tatlı', href: '/menu?tab=restaurant#tatlilar' },
] as const

export default function Featured() {
  return (
    <Section tone="white">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Menümüzden" lead="Öne Çıkan" strong="Lezzetler" subtitle="Her gün taze hazırlanan seçkimizden birkaç örnek." />
        <div className="grid w-full grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-8">
          {featuredItems.map((item) => (
            <Link key={item.slot} href={item.href} className="group flex flex-col items-center gap-3">
              <div className="w-full overflow-hidden rounded-lg">
                <SmartImage slot={item.slot} className="transition-transform duration-200 group-hover:scale-[1.03]" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-ink-soft">{item.category}</p>
              </div>
            </Link>
          ))}
        </div>
        <Button href="/menu" variant="outline">
          Tüm Menüyü Gör
        </Button>
      </Container>
    </Section>
  )
}
