import { cn } from '@/lib/utils'

type SectionProps = {
  children: React.ReactNode
  className?: string
  tone?: 'white' | 'brand-50' | 'brand-900' | 'brand-950'
  id?: string
}

const toneClasses: Record<NonNullable<SectionProps['tone']>, string> = {
  white: 'bg-white',
  'brand-50': 'bg-brand-50',
  'brand-900': 'bg-brand-900 text-white',
  'brand-950': 'bg-brand-950 text-white',
}

export default function Section({ children, className, tone = 'white', id }: SectionProps) {
  return (
    <section id={id} className={cn('py-14 lg:py-24', toneClasses[tone], className)}>
      {children}
    </section>
  )
}
