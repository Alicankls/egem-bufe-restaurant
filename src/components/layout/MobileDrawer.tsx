'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { X, Phone, MessageCircle, Navigation } from 'lucide-react'
import { primaryNav, secondaryNav } from '@/config/nav'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type MobileDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobil menü"
      inert={!isOpen ? true : undefined}
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-brand-950 text-white transition-opacity duration-200',
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="flex items-center justify-end px-5 py-4">
        <button onClick={onClose} aria-label="Menüyü kapat" className="p-2">
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <nav className="flex flex-col px-5">
        {[...primaryNav, ...secondaryNav].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="border-b border-white/10 py-4 text-lg font-semibold uppercase tracking-wide"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex gap-3 px-5 py-6">
        <a href={`tel:${siteConfig.restaurant.phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-white/10 py-3 text-sm font-semibold">
          <Phone className="h-4 w-4" aria-hidden="true" /> Ara
        </a>
        <a href={siteConfig.social.whatsapp} className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-accent-500 py-3 text-sm font-semibold text-ink">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
        <a href={siteConfig.address.directionsUrl} className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-white/10 py-3 text-sm font-semibold">
          <Navigation className="h-4 w-4" aria-hidden="true" /> Yol Tarifi
        </a>
      </div>
    </div>
  )
}
