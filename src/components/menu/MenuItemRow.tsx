import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import { siteConfig } from '@/config/site'
import { formatPrice } from '@/lib/utils'
import type { MenuItem } from '@/data/menu'

export default function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-3">
      {item.image && (
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
          <Image src={item.image} alt={item.name} width={72} height={72} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-ink">{item.name}</p>
            {item.tags?.map((tag) => (
              <Badge key={tag} tag={tag} />
            ))}
          </div>
          {item.desc && <p className="mt-0.5 text-sm text-ink-soft">{item.desc}</p>}
        </div>
        {siteConfig.showPrices && item.price && (
          <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">{formatPrice(item.price)}</span>
        )}
      </div>
    </div>
  )
}
