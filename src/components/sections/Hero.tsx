'use client'
import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SmartImage from '@/components/ui/SmartImage'
import Button from '@/components/ui/Button'
import { useSlider } from '@/lib/useSlider'
import { getOpenStatus, getTodayHours } from '@/lib/hours'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

const slides = [
  {
    imageSlot: 'hero.slide1',
    kicker: 'ÇORLU YENİ SANAYİ BÖLGESİ',
    title: 'Her gün taze, ev yemeği tadında',
    subtitle: 'Sıcak, doyurucu ve güvenilir günlük tabldot lezzetleri.',
    ctaPrimary: { label: 'Bugünün Menüsü', href: '/menu?tab=restaurant' },
    ctaSecondary: { label: 'Restaurant', href: '/restaurant' },
  },
  {
    imageSlot: 'hero.slide2',
    kicker: 'HEMEN AL, GEÇ',
    title: 'Acelesi olana EGEM Büfe',
    subtitle: 'Tost, sandviç ve daha fazlası dakikalar içinde hazır.',
    ctaPrimary: { label: 'Büfe', href: '/bufe' },
    ctaSecondary: { label: 'Menü', href: '/menu?tab=bufe' },
  },
] as const

export default function Hero() {
  const { index, next, prev, goTo } = useSlider(slides.length, 6000)
  const touchStartX = useRef<number | null>(null)
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, prev])

  useEffect(() => {
    // Genel canlı durum rozeti EGEM Büfe saatlerini baz alır (gün içinde en geç kapanan işletme).
    const now = new Date()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(getOpenStatus(getTodayHours(siteConfig.bufe.hours, now), now))
  }, [])

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 50) prev()
    if (delta < -50) next()
    touchStartX.current = null
  }

  const slide = slides[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkan tanıtımlar"
      className="relative h-[78vh] max-h-[900px] w-full overflow-hidden lg:h-screen"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => (
        <div
          key={s.imageSlot}
          className={cn('absolute inset-0 transition-opacity duration-500', i === index ? 'opacity-100' : 'pointer-events-none opacity-0')}
          aria-hidden={i !== index}
        >
          <SmartImage slot={s.imageSlot} className="absolute inset-0 h-full w-full" sizes="100vw" dark />
          <div className="absolute inset-0 bg-brand-950/55" />
        </div>
      ))}

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-5 px-5 text-center text-white">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">{slide.kicker}</span>
        <h1 className="font-display text-[34px] font-extrabold leading-[1.1] lg:text-[72px]">{slide.title}</h1>
        <p className="max-w-xl text-lg font-light leading-[1.6] text-white/85 lg:text-[22px]">{slide.subtitle}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button href={slide.ctaPrimary.href}>{slide.ctaPrimary.label}</Button>
          <Button href={slide.ctaSecondary.href} variant="outline-light">
            {slide.ctaSecondary.label}
          </Button>
        </div>
      </div>

      {status && (
        <div className="absolute bottom-6 left-5 z-10 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur">
          {status.label}
        </div>
      )}

      <button
        onClick={prev}
        aria-label="Önceki slayt"
        className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white/80 hover:text-white"
      >
        <ChevronLeft className="h-9 w-9" aria-hidden="true" />
      </button>
      <button
        onClick={next}
        aria-label="Sonraki slayt"
        className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-white/80 hover:text-white"
      >
        <ChevronRight className="h-9 w-9" aria-hidden="true" />
      </button>

      <div className="absolute bottom-6 right-5 z-10 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.imageSlot}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}. slayta git`}
            className={cn('h-2.5 w-2.5 rounded-full', i === index ? 'bg-accent-500' : 'bg-white/50')}
          />
        ))}
      </div>
    </section>
  )
}
