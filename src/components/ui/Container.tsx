import { cn } from '@/lib/utils'

export default function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-container px-5 lg:px-8', className)}>{children}</div>
}
