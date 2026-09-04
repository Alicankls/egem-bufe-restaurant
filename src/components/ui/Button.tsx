import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonProps = {
  href?: string
  onClick?: () => void
  variant?: 'solid' | 'outline' | 'outline-light'
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  solid: 'bg-brand-500 text-white hover:bg-brand-600',
  outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50',
  'outline-light': 'border border-white text-white hover:bg-white/10',
}

export default function Button({ href, onClick, variant = 'solid', children, className, type = 'button' }: ButtonProps) {
  const classes = cn(
    'inline-flex min-h-[44px] items-center justify-center rounded-btn px-6 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-200',
    variantClasses[variant],
    className
  )
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
