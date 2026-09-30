import { MapPin, Phone, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'
import SmartImage from '@/components/ui/SmartImage'
import Container from '@/components/ui/Container'

// Not: Facebook / Instagram / YouTube bağlantıları ve ikonları istek üzerine
// footer'dan tamamen kaldırıldı. Kalan tek sosyal kanal WhatsApp.

export default function Footer() {
  return (
    <footer className="bg-brand-950 pb-24 pt-16 text-white lg:pb-16">
      <Container>
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <SmartImage slot="brand.logoLight" className="mb-4 h-12 w-44" dark sizes="176px" />
            <p className="text-sm text-white/70">
              Çorlu Zafer Mahallesi&apos;nde günlük tabldot ve hızlı lezzetlerle her gün yanınızdayız.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            <a href={siteConfig.address.directionsUrl} className="flex items-center gap-2 hover:text-white">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" /> {siteConfig.address.line}
            </a>
            <a href={`tel:${siteConfig.restaurant.phone}`} className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> Restaurant: {siteConfig.restaurant.phoneDisplay}
            </a>
            <a href={`tel:${siteConfig.bufe.phone}`} className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> Büfe: {siteConfig.bufe.phoneDisplay}
            </a>
            <a href={siteConfig.social.whatsapp} className="flex items-center gap-2 hover:text-white">
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 pt-6 text-xs text-white/60 lg:flex-row lg:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.brandName}. Tüm hakları saklıdır.
          </p>
          <a
            href={siteConfig.social.whatsapp}
            aria-label="WhatsApp"
            className="flex h-11 w-11 items-center justify-center"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </Container>
    </footer>
  )
}
