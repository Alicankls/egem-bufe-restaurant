import { cn } from '@/lib/utils'

type SectionTitleProps = {
  kicker?: string
  lead: string
  strong: string
  subtitle?: string
  align?: 'left' | 'center'
  light?: boolean
}

export default function SectionTitle({ kicker, lead, strong, subtitle, align = 'center', light = false }: SectionTitleProps) {
  return (
    <div className={cn('flex flex-col gap-3', align === 'center' ? 'items-center text-center' : 'items-start text-left')}>
      {kicker && <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">{kicker}</span>}
      <h2 className={cn('font-display text-[26px] leading-[1.2] lg:text-[44px]', light ? 'text-white' : 'text-ink')}>
        <span className="font-normal">{lead} </span>
        <span className="font-extrabold">{strong}</span>
      </h2>
      {subtitle && (
        <p className={cn('max-w-[65ch] text-[17px] leading-[1.65]', light ? 'text-white/80' : 'text-ink-soft')}>{subtitle}</p>
      )}
    </div>
  )
}
