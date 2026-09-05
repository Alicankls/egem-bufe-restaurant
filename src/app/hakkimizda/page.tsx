import type { Metadata } from 'next'
import { Leaf, ShieldCheck, Timer, Wallet } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import SmartImage from '@/components/ui/SmartImage'
import SectionTitle from '@/components/ui/SectionTitle'
import { features } from '@/data/features'
import { siteConfig } from '@/config/site'

const iconMap = { leaf: Leaf, 'shield-check': ShieldCheck, timer: Timer, wallet: Wallet } as const

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: `${siteConfig.brandName} olarak Çorlu Yeni Sanayi Bölgesi'nde neden güvenilir bir tercih olduğumuzu öğrenin.`,
  alternates: { canonical: '/hakkimizda' },
}

export default function AboutPage() {
  return (
    <div>
      <PageHero imageSlot="about.hero" title="Hakkımızda" breadcrumbLabel="Hakkımızda" />

      <Section tone="white">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">Bizi Tanıyın</span>
            <h2 className="mt-3 font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">
              Sanayi bölgesinin güvenilir sofrası
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Nereden Geldik?</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">
                EGEM ailesi, Çorlu Yeni Sanayi Bölgesi&apos;nin günlük yemek ihtiyacını karşılamak amacıyla yola çıktı.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Nereye Gidiyoruz?</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">
                Restaurant ve büfe tarafımızla, bölgedeki herkese güvenilir ve tutarlı bir lezzet standardı sunmaya devam
                ediyoruz.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="brand-50">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SmartImage slot="about.wide" className="rounded-lg" />
          <div>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">Lokantamız Hakkında</span>
            <h2 className="mt-3 font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[36px]">
              Ev yemeği tadında, sanayi bölgesi hızında
            </h2>
            <p className="mt-4 max-w-[60ch] text-[17px] leading-[1.65] text-ink-soft">
              Mutfağımızda her gün taze pişen yemekler, yoğun sanayi bölgesi temposuna uygun hızlı bir servisle birleşiyor.
              Amacımız, her öğünde eve gelmiş gibi hissettirmek.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon]
            return (
              <div key={feature.title} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="font-display text-base font-bold text-ink">{feature.title}</p>
                <p className="text-sm text-ink-soft">{feature.desc}</p>
              </div>
            )
          })}
        </Container>
      </Section>

      <SmartImage slot="about.wideBand" sizes="100vw" />

      <Section tone="white">
        <Container className="flex flex-col items-center gap-10">
          <SectionTitle kicker="Galeri" lead="Ekibimizden ve" strong="Mekânımızdan" />
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
            <SmartImage slot="about.gallery.1" className="rounded-lg" />
            <SmartImage slot="about.gallery.2" className="rounded-lg" />
            <SmartImage slot="about.gallery.3" className="rounded-lg" />
            <SmartImage slot="about.gallery.4" className="rounded-lg" />
            <SmartImage slot="about.gallery.5" className="rounded-lg" />
            <SmartImage slot="about.gallery.6" className="rounded-lg" />
          </div>
          <Button href="/iletisim" variant="outline">
            Bize Ulaşın
          </Button>
        </Container>
      </Section>
    </div>
  )
}
