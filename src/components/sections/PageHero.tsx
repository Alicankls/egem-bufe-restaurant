import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import SmartImage from '@/components/ui/SmartImage'
import Container from '@/components/ui/Container'

type PageHeroProps = {
  imageSlot: string
  title: string
  breadcrumbLabel: string
}

export default function PageHero({ imageSlot, title, breadcrumbLabel }: PageHeroProps) {
  return (
    <div className="relative flex h-[420px] w-full items-end overflow-hidden">
      <SmartImage slot={imageSlot} className="absolute inset-0 h-full" dark sizes="100vw" />
      <div className="absolute inset-0 bg-brand-950/55" />
      <Container className="relative z-10 pb-10 text-white">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-sm text-white/70">
          <Link href="/" className="hover:text-white">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-white">{breadcrumbLabel}</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold lg:text-5xl">{title}</h1>
      </Container>
    </div>
  )
}
