'use client'
import { useEffect, useState } from 'react'
import { Phone, MessageCircle, Navigation } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/config/site'
import { getTodayWeekday, type BusinessHours, type Weekday } from '@/lib/hours'

const dayLabels: Record<Weekday, string> = {
  pazartesi: 'Pazartesi',
  sali: 'Salı',
  carsamba: 'Çarşamba',
  persembe: 'Perşembe',
  cuma: 'Cuma',
  cumartesi: 'Cumartesi',
  pazar: 'Pazar',
}

const dayOrder: Weekday[] = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar']

function HoursTable({ title, hours }: { title: string; hours: BusinessHours }) {
  const [todayKey, setTodayKey] = useState<Weekday | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayKey(getTodayWeekday())
  }, [])

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <table className="w-full text-sm">
        <tbody>
          {dayOrder.map((day) => (
            <tr key={day} className={day === todayKey ? 'font-semibold text-brand-500' : 'text-ink-soft'}>
              <td className="py-1">{dayLabels[day]}</td>
              <td className="py-1 text-right tabular-nums">{hours[day] ? `${hours[day]!.open} - ${hours[day]!.close}` : 'Kapalı'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function LocationHours() {
  return (
    <Section tone="white" className="!py-0">
      <div className="grid lg:grid-cols-2">
        <div className="h-[360px] w-full lg:h-full">
          <iframe
            src={siteConfig.address.mapEmbedUrl}
            loading="lazy"
            title="Konum haritası"
            className="h-full w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <Container className="flex flex-col gap-6 py-14">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">Bize Ulaşın</p>
            <p className="mt-2 text-[17px] text-ink-soft">{siteConfig.address.line}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <HoursTable title={siteConfig.restaurant.name} hours={siteConfig.restaurant.hours} />
            <HoursTable title={siteConfig.bufe.name} hours={siteConfig.bufe.hours} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={`tel:${siteConfig.restaurant.phone}`}>
              <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
              Ara
            </Button>
            <Button href={siteConfig.social.whatsapp} variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              WhatsApp
            </Button>
            <Button href={siteConfig.address.directionsUrl} variant="outline">
              <Navigation className="mr-2 h-4 w-4" aria-hidden="true" />
              Yol Tarifi
            </Button>
          </div>
        </Container>
      </div>
    </Section>
  )
}
