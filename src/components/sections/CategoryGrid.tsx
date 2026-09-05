import Link from 'next/link'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import { bufeMenu } from '@/data/bufe'

const categorySlots = ['bufe.category.1', 'bufe.category.2', 'bufe.category.3', 'bufe.category.4', 'bufe.category.5', 'bufe.category.6'] as const

export default function CategoryGrid() {
  return (
    <Section tone="white">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Büfe Menüsü" lead="Kategorilere" strong="Göz Atın" />
        <div className="grid w-full grid-cols-2 gap-5 lg:grid-cols-3">
          {bufeMenu.map((category, i) => (
            <Link key={category.key} href={`/menu?tab=bufe#${category.key}`} className="group flex flex-col overflow-hidden rounded-xl shadow-sm">
              <SmartImage slot={categorySlots[i]} className="transition-transform duration-200 group-hover:scale-[1.03]" />
              <div className="bg-white p-4 text-center">
                <p className="text-[15px] font-semibold text-ink">{category.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
