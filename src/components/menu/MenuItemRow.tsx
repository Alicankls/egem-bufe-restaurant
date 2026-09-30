import { siteConfig } from '@/config/site'
import { formatPrice, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { MenuItem } from '@/data/menu'

export default function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <div className={cn('flex items-center gap-4 border-b border-line py-3', item.soldOut && 'opacity-50')}>
      {item.image && (
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-ink">{item.name}</p>
            {item.soldOut && (
              <span className="rounded-full bg-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft">Tükendi</span>
            )}
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
