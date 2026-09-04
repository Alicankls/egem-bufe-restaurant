import Link from 'next/link'
import { UtensilsCrossed, Phone, MessageCircle, Navigation } from 'lucide-react'
import { siteConfig } from '@/config/site'

const items = [
  { key: 'menu', label: 'Menü', icon: UtensilsCrossed, href: '/menu' },
  { key: 'call', label: 'Ara', icon: Phone, href: `tel:${siteConfig.restaurant.phone}` },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: siteConfig.social.whatsapp },
  { key: 'directions', label: 'Yol Tarifi', icon: Navigation, href: siteConfig.address.directionsUrl },
]

export default function MobileActionBar() {
  return (
    <nav
      aria-label="Hızlı işlemler"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map(({ key, label, icon: Icon, href }) => (
        <Link key={key} href={href} className="flex min-h-[44px] flex-col items-center justify-center gap-1 py-2.5 text-ink">
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
