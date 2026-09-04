import Link from 'next/link'
import SmartImage from '@/components/ui/SmartImage'

const banners = [
  { slot: 'home.mosaic.1', kicker: 'Günlük Lezzet', title: 'RESTAURANT', text: 'Her gün taze pişen ev yemekleri.', href: '/restaurant' },
  { slot: 'home.mosaic.2', kicker: '', title: '', text: '', href: '/menu?tab=restaurant' },
  { slot: 'home.mosaic.3', kicker: 'Hızlı Mola', title: 'BÜFE', text: 'Tost, sandviç ve daha fazlası.', href: '/bufe' },
  { slot: 'home.mosaic.4', kicker: 'Sanayi Bölgesine Özel', title: 'TOPLU YEMEK', text: 'Kumanya ve paket öğle yemeği hizmeti.', href: '/iletisim' },
] as const

export default function MosaicBanners() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4">
      {banners.map((banner) => (
        <Link key={banner.slot} href={banner.href} className="group relative block h-[240px] overflow-hidden lg:h-[420px]">
          <SmartImage slot={banner.slot} className="h-full" />
          <div className="absolute inset-0 bg-brand-950/50 transition-colors duration-200 group-hover:bg-brand-950/65" />
          {banner.title && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center text-white">
              {banner.kicker && <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">{banner.kicker}</span>}
              <span className="font-display text-2xl font-extrabold">{banner.title}</span>
              <span className="text-sm text-white/85">{banner.text}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
