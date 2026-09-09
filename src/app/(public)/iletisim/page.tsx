import type { Metadata } from 'next'
import Container from '@/components/ui/Container'
import Accordion from '@/components/ui/Accordion'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import ContactForm from '@/components/sections/ContactForm'
import LocationHours from '@/components/sections/LocationHours'
import { faqs } from '@/data/faq'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'İletişim',
  description: `${siteConfig.brandName} ile iletişime geçin — telefon, WhatsApp, adres ve sık sorulan sorular.`,
  alternates: { canonical: '/iletisim' },
}

export default function ContactPage() {
  return (
    <div>
      <div className="relative overflow-hidden py-12 pt-28 text-white lg:pt-32">
        <SmartImage slot="contact.hero" absolute className="inset-0" dark sizes="100vw" />
        <div className="absolute inset-0 bg-brand-950/75" />
        <Container className="relative z-10">
          <h1 className="font-display text-3xl font-extrabold lg:text-4xl">İletişim</h1>
        </Container>
      </div>

      <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:divide-x lg:divide-line lg:py-24">
        <div className="lg:pr-10">
          <SectionTitle kicker="Merak Ettikleriniz" lead="Sık Sorulan" strong="Sorular" align="left" />
          <div className="mt-6">
            <Accordion items={faqs} defaultOpenIndex={0} />
          </div>
        </div>
        <div className="lg:pl-10">
          <SectionTitle kicker="Sorunuz mu Var?" lead="Bizimle İletişime" strong="Geçin" align="left" />
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </Container>

      <LocationHours />
    </div>
  )
}
