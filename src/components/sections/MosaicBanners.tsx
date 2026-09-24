import Link from 'next/link'
import SmartImage from '@/components/ui/SmartImage'
import { cn } from '@/lib/utils'

type Tile = {
  slot: string
  href: string
  linkLabel: string
  span: string
  kicker?: string
  title?: string
  text?: string
  caption?: string
}

const tiles: Tile[] = [
  {
    slot: 'home.mosaic.1',
    href: '/restaurant',
    linkLabel: 'Restaurant sayfasına git',
    span: 'col-span-2 row-span-2',
    kicker: 'Günlük Lezzet',
    title: 'RESTAURANT',
    text: 'Her gün taze pişen ev yemekleri.',
  },
  {
    slot: 'home.mosaic.2',
    href: '/bufe',
    linkLabel: 'Büfe sayfasına git',
    span: 'col-span-2 row-span-2',
    kicker: 'Hızlı Mola',
    title: 'BÜFE',
    text: 'Tost, sandviç ve daha fazlası.',
  },
  {
    slot: 'home.mosaic.3',
    href: '/bufe',
    linkLabel: 'Büfe oturma alanını gör',
    span: 'col-span-1 row-span-1',
    caption: 'Oturma Alanı',
  },
  {
    slot: 'home.mosaic.4',
    href: '/menu?tab=bufe',
    linkLabel: 'Büfe menüsünü gör',
    span: 'col-span-1 row-span-1',
    caption: 'Günlük Mezeler',
  },
  {
    slot: 'home.mosaic.5',
    href: '/bufe',
    linkLabel: 'Büfe reyonlarını gör',
    span: 'col-span-2 row-span-1',
    caption: 'Atıştırmalık Çeşitleri',
  },
]

export default function MosaicBanners() {
  return (
    <div className="grid grid-cols-2 auto-rows-[170px] bg-brand-950 sm:auto-rows-[200px] lg:grid-cols-4 lg:auto-rows-[210px]">
      {tiles.map((tile) => (
        <Link
          key={tile.slot}
          href={tile.href}
          aria-label={tile.linkLabel}
          className={cn('group relative block overflow-hidden', tile.span)}
        >
          <SmartImage
            slot={tile.slot}
            className="h-full transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          {tile.title ? (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/25 to-transparent transition-opacity duration-200 group-hover:from-brand-950/95 group-hover:via-brand-950/45"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-5 text-left lg:p-8">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent-500 lg:text-[13px]">
                  {tile.kicker}
                </span>
                <span className="font-display text-2xl font-extrabold text-white lg:text-4xl">{tile.title}</span>
                <span className="text-sm text-white/85 lg:text-base">{tile.text}</span>
              </div>
            </>
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-950/90 to-transparent transition-opacity duration-200 group-hover:from-brand-950/95"
              />
              <span className="absolute inset-x-0 bottom-0 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white lg:text-xs">
                {tile.caption}
              </span>
            </>
          )}
        </Link>
      ))}
    </div>
  )
}
