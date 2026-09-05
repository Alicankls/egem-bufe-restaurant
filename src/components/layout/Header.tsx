'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Phone, MessageCircle, Menu as MenuIcon } from 'lucide-react'
import { primaryNav, secondaryNav } from '@/config/nav'
import { siteConfig } from '@/config/site'
import SmartImage from '@/components/ui/SmartImage'
import MobileDrawer from './MobileDrawer'
import { cn } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMenuPage = pathname === '/menu'

  useEffect(() => {
    if (!isHome) return
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  if (isMenuPage) {
    return (
      <header role="banner" className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-brand-950 px-5">
        <Link href="/" aria-label={siteConfig.brandName}>
          <SmartImage slot="brand.logoLight" className="h-9 w-[140px]" dark sizes="140px" />
        </Link>
        <div className="flex items-center gap-4">
          <a href={`tel:${siteConfig.restaurant.phone}`} aria-label="Ara" className="p-3 text-white">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </a>
          <a href={siteConfig.social.whatsapp} aria-label="WhatsApp" className="p-3 text-white">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </header>
    )
  }

  const dark = !isHome || scrolled

  return (
    <>
      <header
        role="banner"
        className={cn(
          'fixed inset-x-0 top-0 z-40 h-16 transition-colors duration-[250ms]',
          dark ? 'bg-brand-950 shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="hidden h-16 items-center px-8 lg:flex">
          <div className="flex flex-1 items-center gap-8">
            <button aria-label="Ara" className="p-3 text-white">
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
            <nav className="flex gap-6">
              {primaryNav.map((item) => (
                <Link key={item.href} href={item.href} className="text-[13px] font-semibold uppercase tracking-[0.04em] text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="flex items-center justify-center" aria-label={siteConfig.brandName}>
            <SmartImage slot="brand.logoLight" className="h-[52px] w-[200px]" dark sizes="200px" />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-8">
            <nav className="flex gap-6">
              {secondaryNav.map((item) => (
                <Link key={item.href} href={item.href} className="text-[13px] font-semibold uppercase tracking-[0.04em] text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
            <a href={`tel:${siteConfig.restaurant.phone}`} className="flex items-center gap-2 text-white">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="text-[13px] font-semibold">{siteConfig.restaurant.phoneDisplay}</span>
            </a>
          </div>
        </div>

        <div className="flex h-16 items-center justify-between px-5 lg:hidden">
          <button aria-label="Menüyü aç" onClick={() => setDrawerOpen(true)} className="p-2.5 text-white">
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link href="/" aria-label={siteConfig.brandName}>
            <SmartImage slot="brand.logoLight" className="h-9 w-[140px]" dark sizes="140px" />
          </Link>
          <a href={`tel:${siteConfig.restaurant.phone}`} aria-label="Ara" className="p-3 text-white">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
