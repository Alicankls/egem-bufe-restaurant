import { MapPin, Phone, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'
import SmartImage from '@/components/ui/SmartImage'
import Container from '@/components/ui/Container'

// lucide-react marka/logo ikonlarını (Facebook, Instagram, YouTube) artık paketten
// çıkardığı için bu üçü elle yazılmış küçük SVG bileşenleri olarak tanımlanır.
// Ek bir paket bağımlılığı eklemez.
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9H16l-.4 2.9h-2.1v7A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2c-2.7 0-3.1 0-4.1.1-1.1.1-1.8.2-2.4.5-.7.3-1.2.6-1.8 1.2-.6.6-.9 1.1-1.2 1.8-.3.6-.4 1.3-.5 2.4C2 9 2 9.4 2 12s0 3.1.1 4.1c.1 1.1.2 1.8.5 2.4.3.7.6 1.2 1.2 1.8.6.6 1.1.9 1.8 1.2.6.3 1.3.4 2.4.5C8.9 22 9.3 22 12 22s3.1 0 4.1-.1c1.1-.1 1.8-.2 2.4-.5.7-.3 1.2-.6 1.8-1.2.6-.6.9-1.1 1.2-1.8.3-.6.4-1.3.5-2.4.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-1.1-.2-1.8-.5-2.4-.3-.7-.6-1.2-1.2-1.8-.6-.6-1.1-.9-1.8-1.2-.6-.3-1.3-.4-2.4-.5C15.1 2 14.7 2 12 2Zm0 1.8c2.6 0 2.9 0 4 .1.9.1 1.5.2 1.8.3.5.2.8.4 1.1.7.3.3.5.6.7 1.1.1.3.3.9.3 1.8.1 1.1.1 1.4.1 4s0 2.9-.1 4c-.1.9-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.3.3-.6.5-1.1.7-.3.1-.9.3-1.8.3-1.1.1-1.4.1-4 .1s-2.9 0-4-.1c-.9-.1-1.5-.2-1.8-.3-.5-.2-.8-.4-1.1-.7-.3-.3-.5-.6-.7-1.1-.1-.3-.3-.9-.3-1.8-.1-1.1-.1-1.4-.1-4s0-2.9.1-4c.1-.9.2-1.5.3-1.8.2-.5.4-.8.7-1.1.3-.3.6-.5 1.1-.7.3-.1.9-.3 1.8-.3 1.1-.1 1.4-.1 4-.1Zm0 3.1a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm5.3-8.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
    </svg>
  )
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23 12s0-3.6-.5-5.3c-.3-1-1-1.8-2-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.5.5c-1 .3-1.7 1-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3c.3 1 1 1.7 2 2 1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5c1-.3 1.7-1 2-2 .5-1.7.5-5.3.5-5.3ZM9.8 15.5V8.5l6.2 3.5-6.2 3.5Z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-brand-950 pb-24 pt-16 text-white lg:pb-16">
      <Container>
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <SmartImage slot="brand.logoLight" className="mb-4 h-12 w-44" dark sizes="176px" />
            <p className="text-sm text-white/70">
              Çorlu Yeni Sanayi Bölgesi&apos;nde günlük tabldot ve hızlı lezzetlerle her gün yanınızdayız.
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
          <div className="flex gap-1">
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="flex h-11 w-11 items-center justify-center">
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="flex h-11 w-11 items-center justify-center">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href={siteConfig.social.youtube} aria-label="YouTube" className="flex h-11 w-11 items-center justify-center">
              <YoutubeIcon className="h-4 w-4" />
            </a>
            <a href={siteConfig.social.whatsapp} aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
