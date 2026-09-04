import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { restaurantMenu } from '@/data/menu'
import { siteConfig } from '@/config/site'
import { formatPrice } from '@/lib/utils'

export default function MenuPreview() {
  const previewCategories = restaurantMenu.slice(0, 4)

  return (
    <Section tone="brand-50">
      <Container className="flex flex-col gap-10">
        <SectionTitle kicker="Menümüz" lead="Neler" strong="Sunuyoruz?" />
        <div className="grid gap-8 lg:grid-cols-2">
          {previewCategories.map((category) => (
            <div key={category.key}>
              <h3 className="mb-3 font-display text-lg font-bold text-ink">{category.title}</h3>
              <ul className="flex flex-col divide-y divide-line">
                {category.items.slice(0, 4).map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] text-ink">{item.name}</span>
                      {item.tags?.map((tag) => (
                        <Badge key={tag} tag={tag} />
                      ))}
                    </div>
                    {siteConfig.showPrices && item.price && (
                      <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">{formatPrice(item.price)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button href="/menu?tab=restaurant">Tüm Menü</Button>
        </div>
      </Container>
    </Section>
  )
}
