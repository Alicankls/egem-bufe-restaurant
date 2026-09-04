import { cn } from '@/lib/utils'
import type { MenuTag } from '@/data/menu'

const badgeStyles: Record<MenuTag, string> = {
  acili: 'bg-red-50 text-red-600',
  vejetaryen: 'bg-green-50 text-green-700',
  yeni: 'bg-brand-100 text-brand-700',
  'gunun-yemegi': 'bg-accent-500/15 text-accent-500',
}

const badgeLabels: Record<MenuTag, string> = {
  acili: 'Acılı',
  vejetaryen: 'Vejetaryen',
  yeni: 'Yeni',
  'gunun-yemegi': 'Günün Yemeği',
}

export default function Badge({ tag, className }: { tag: MenuTag; className?: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', badgeStyles[tag], className)}>
      {badgeLabels[tag]}
    </span>
  )
}
