import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import { bufeMenu } from '@/data/bufe'

const popularNames = ['Ayvalık Tostu', 'Karışık Tost', 'Kaşarlı Hamburger', 'Tavuklu Sandviç', 'Patates Kızartması']

export default function PopularStrip() {
  const allItems = bufeMenu.flatMap((c) => c.items)
  const popularItems = popularNames.map((name) => allItems.find((item) => item.name === name)).filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <Section tone="brand-50">
      <Container className="flex flex-col gap-8">
        <SectionTitle kicker="En Çok Tercih Edilenler" lead="Popüler" strong="Ürünler" align="left" />
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {popularItems.map((item) => (
            <div key={item.name} className="min-w-[180px] shrink-0 rounded-xl bg-white p-5 shadow-sm" style={{ scrollSnapAlign: 'start' }}>
              <p className="text-[15px] font-semibold text-ink">{item.name}</p>
              {item.desc && <p className="mt-1 text-sm text-ink-soft">{item.desc}</p>}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
