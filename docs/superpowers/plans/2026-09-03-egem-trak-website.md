# EGEM-TRAK & EGEM Büfe Web Sitesi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js (App Router, TS strict) tanıtım sitesi kurmak — EGEM-TRAK Restaurant ve EGEM Büfe'yi tek marka altında tanıtan, satışsız, QR ile açılan bir dijital menü sunan, görselsizken bile profesyonel görünen, görsel eklenince layout kaymayan bir site.

**Architecture:** Config-driven içerik (`src/config`, `src/data`) + yeniden kullanılabilir `ui/` bileşen kiti + her anasayfa bölümü kendi dosyasında `sections/` altında + sayfalar yalnızca bölümleri dizer. Görseller `images.ts` slot kayıt sistemi + `SmartImage` bileşeni üzerinden akar; `src` `null` olduğunda markalı placeholder gösterilir, sabit aspect-ratio ile CLS sıfırlanır.

**Tech Stack:** Next.js (App Router) + TypeScript strict, Tailwind CSS, next/font (Plus Jakarta Sans + Inter, self-hosted), next/image, lucide-react, `qrcode` (yalnızca /qr), Vitest + @testing-library/react (yalnızca saf mantık ve etkileşimli bileşenler için — bkz. Test Politikası).

**Spec:** `docs/superpowers/specs/2026-09-03-egem-trak-website-design.md`

## Global Constraints

- Next.js App Router + TypeScript strict; ek UI/animasyon kütüphanesi YOK (shadcn/MUI/Bootstrap/framer-motion/GSAP/AOS/swiper yasak). Slider/scroll-snap kendi hook'larıyla yazılır.
- Sepet/ödeme/üyelik/sipariş/e-ticaret UI'ı KESİNLİKLE yok. Menü sayfalarında fiyat kartı + "sepete ekle" YOK.
- Tüm renkler Tailwind theme token'ından gelir (`bg-brand-950` vb.); component içinde hex YOK. Sarı (`accent-500`) toplam görsel alanın ≤%5'i.
- Tüm görseller `src/config/images.ts` slot kaydından + `<SmartImage slot="..." />` üzerinden gelir (menü ürün görselleri hariç — bkz. Task 6). Component içine `<Image src="/images/...">` doğrudan YAZILMAZ.
- Telefon/WhatsApp/adres/saat yalnızca `src/config/site.ts`'de geçer, başka hiçbir dosyaya hard-code edilmez.
- Dil Türkçe, `<html lang="tr">`, kod yorumları Türkçe.
- Font subset: `latin` + `latin-ext` (Türkçe karakterler için zorunlu).
- 360px genişlikte yatay kaydırma (`overflow-x`) olmayacak; dokunma hedefleri min 44px.
- `page.tsx` dosyaları yalnızca section/component dizer; 200 satırı geçen component parçalanır.
- Her görev sonunda: `npm run lint` ve `npx tsc --noEmit` temiz olmalı.

**Test Politikası (spec'in kendi teslimat listesi yalnızca "lint + TypeScript hatasız" ve "build temiz" istiyor, ayrı bir test paketi istemiyor — bu yüzden TDD'yi orantılı uyguluyoruz):**
- **Tam TDD (Vitest, önce test):** saf mantık — `lib/hours.ts`, `lib/utils.ts`, `lib/useSlider.ts` index matematiği, `lib/menuSearch.ts`.
- **Hafif TDD (Vitest + @testing-library/react, önce test):** klavye/etkileşim içeren bileşenler — `Header` (sticky/transparent geçişi), `Accordion`, `Tabs`, `VideoModal`, `Lightbox`, `SmartImage` (src null/dolu farkı), `useActiveSection`.
- **Test yok, yalnızca build+typecheck+manuel doğrulama:** salt sunum bileşenleri (Section, Container, Button, Badge, SectionTitle, tüm `sections/*`, sayfa dosyaları, config/data dosyaları). Bu görevlerin "Adım"ları test yazmak yerine dosyayı oluşturup `npm run dev` üzerinde görsel doğrulama talimatı içerir.

---

## Faz 1 — Altyapı, Config, Veri, Header/Footer

### Task 1: Next.js scaffold + Tailwind tasarım tokenleri + fontlar

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `.eslintrc.json`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (geçici boş sayfa)
- Create: `vitest.config.ts`, `vitest.setup.ts`

**Interfaces:**
- Produces: Tailwind renk token'ları (`brand-950`…`white`, `accent-500`, `ink`, `ink-soft`, `line`), CSS font değişkenleri `--font-display` (Plus Jakarta Sans), `--font-sans` (Inter). Sonraki tüm görevler bu token isimlerini kullanır.

- [ ] **Step 1: Next.js + TypeScript + Tailwind bağımlılıklarını kur**

```bash
npm create next-app@latest . -- --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Kurulum sihirbazı sorarsa: "Would you like to use `src/` directory?" → Yes (zaten flag ile verildi), diğerlerini flag'ler karşılıyor. Kurulum bitince `npm install lucide-react qrcode` ve `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/qrcode` çalıştır.

- [ ] **Step 2: `tailwind.config.ts` — renk token'larını CSS değişkeni üzerinden tanımla**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-950': 'rgb(var(--color-brand-950) / <alpha-value>)',
        'brand-900': 'rgb(var(--color-brand-900) / <alpha-value>)',
        'brand-700': 'rgb(var(--color-brand-700) / <alpha-value>)',
        'brand-600': 'rgb(var(--color-brand-600) / <alpha-value>)',
        'brand-500': 'rgb(var(--color-brand-500) / <alpha-value>)',
        'brand-200': 'rgb(var(--color-brand-200) / <alpha-value>)',
        'brand-100': 'rgb(var(--color-brand-100) / <alpha-value>)',
        'brand-50': 'rgb(var(--color-brand-50) / <alpha-value>)',
        'accent-500': 'rgb(var(--color-accent-500) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--color-ink-soft) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: `src/app/globals.css` — CSS değişkenlerini tanımla**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-brand-950: 7 33 56;
  --color-brand-900: 10 37 64;
  --color-brand-700: 16 80 140;
  --color-brand-600: 20 97 168;
  --color-brand-500: 26 115 199;
  --color-brand-200: 195 220 242;
  --color-brand-100: 230 240 250;
  --color-brand-50: 245 249 253;
  --color-accent-500: 247 181 0;
  --color-ink: 20 32 44;
  --color-ink-soft: 91 107 124;
  --color-line: 227 233 240;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

body {
  color: rgb(var(--color-ink));
  background-color: #ffffff;
}

.fade-up {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.fade-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 4: `src/app/layout.tsx` — fontları yükle, `<html lang="tr">`**

```tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EGEM-TRAK Restaurant & EGEM Büfe',
  description: 'Çorlu Yeni Sanayi Bölgesi\'nde günlük tabldot ve hızlı lezzetler.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: `vitest.config.ts` ve `vitest.setup.ts` — test altyapısını kur**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// @ts-expect-error - test ortamı için basitleştirilmiş mock
global.IntersectionObserver = MockIntersectionObserver

// jsdom window.matchMedia sağlamaz — prefers-reduced-motion kontrolü yapan
// hook'lar (useSlider, useReveal) için sahte bir implementasyon tanımlanır.
window.matchMedia =
  window.matchMedia ||
  function matchMedia(query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList
  }
```

`npm install -D @vitejs/plugin-react` çalıştır (vitest.config.ts için gerekli).

`package.json` içine `"test": "vitest run"` script'i ekle.

- [ ] **Step 6: Doğrula**

Run: `npm run build`
Expected: Hatasız, "Compiled successfully" çıktısı.

Run: `npm run lint`
Expected: Hatasız.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Next.js + TypeScript + Tailwind + font + test altyapısı kurulumu"
```

---

### Task 2: `lib/utils.ts` ve `lib/hours.ts` — saf mantık, tam TDD

**Files:**
- Create: `src/lib/utils.ts`, `src/lib/utils.test.ts`
- Create: `src/lib/hours.ts`, `src/lib/hours.test.ts`

**Interfaces:**
- Produces: `cn(...classes: (string | false | null | undefined)[]): string`; `formatPrice(value: number): string`; `formatTurkishDate(date: Date): string`; `slugify(text: string): string`.
- Produces: `type Weekday = 'pazartesi'|'sali'|'carsamba'|'persembe'|'cuma'|'cumartesi'|'pazar'`; `type DayHours = { open: string; close: string } | null`; `type BusinessHours = Record<Weekday, DayHours>`; `getTodayWeekday(now?: Date): Weekday`; `getTodayHours(hours: BusinessHours, now?: Date): DayHours`; `getOpenStatus(dayHours: DayHours, now?: Date): { isOpen: boolean; label: string }`.

- [ ] **Step 1: `src/lib/utils.test.ts` — başarısız testleri yaz**

```ts
import { describe, it, expect } from 'vitest'
import { cn, formatPrice, formatTurkishDate, slugify } from './utils'

describe('cn', () => {
  it('boş/false/null/undefined değerleri filtreler ve birleştirir', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})

describe('formatPrice', () => {
  it('sayıyı Türk Lirası formatında döner', () => {
    expect(formatPrice(120)).toBe('120 ₺')
  })
})

describe('formatTurkishDate', () => {
  it('tarihi Türkçe uzun formatta döner', () => {
    expect(formatTurkishDate(new Date(2026, 8, 3))).toBe('3 Eylül 2026')
  })
})

describe('slugify', () => {
  it('Türkçe karakterleri ASCII\'ye çevirip kebab-case yapar', () => {
    expect(slugify('Zeytinyağlı Taze Fasülye')).toBe('zeytinyagli-taze-fasulye')
  })
})
```

- [ ] **Step 2: Testleri çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/utils.test.ts`
Expected: FAIL — `Cannot find module './utils'`

- [ ] **Step 3: `src/lib/utils.ts` implementasyonu**

```ts
// Ortak yardımcı fonksiyonlar

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString('tr-TR')} ₺`
}

export function formatTurkishDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
}

export function slugify(text: string): string {
  const normalized = text
    .split('')
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join('')
  return normalized
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 4: Testleri çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/utils.test.ts`
Expected: PASS (4/4)

- [ ] **Step 5: `src/lib/hours.test.ts` — başarısız testleri yaz**

```ts
import { describe, it, expect } from 'vitest'
import { getTodayHours, getTodayWeekday, getOpenStatus, type BusinessHours } from './hours'

const hours: BusinessHours = {
  pazartesi: { open: '08:00', close: '22:00' },
  sali: { open: '08:00', close: '22:00' },
  carsamba: { open: '08:00', close: '22:00' },
  persembe: { open: '08:00', close: '22:00' },
  cuma: { open: '08:00', close: '22:00' },
  cumartesi: { open: '09:00', close: '20:00' },
  pazar: null,
}

describe('getTodayHours', () => {
  it('JS gün indeksini (0=Pazar) doğru Weekday anahtarına eşler', () => {
    // 2026-09-07 Pazartesi
    expect(getTodayHours(hours, new Date(2026, 8, 7))).toEqual({ open: '08:00', close: '22:00' })
    // 2026-09-06 Pazar
    expect(getTodayHours(hours, new Date(2026, 8, 6))).toBeNull()
  })
})

describe('getTodayWeekday', () => {
  it('tarihten Weekday anahtarını döner', () => {
    expect(getTodayWeekday(new Date(2026, 8, 7))).toBe('pazartesi')
    expect(getTodayWeekday(new Date(2026, 8, 6))).toBe('pazar')
  })
})

describe('getOpenStatus', () => {
  it('açılış-kapanış arasındaysa açık döner', () => {
    const now = new Date(2026, 8, 7, 14, 0)
    const status = getOpenStatus(getTodayHours(hours, now), now)
    expect(status.isOpen).toBe(true)
    expect(status.label).toBe("Şu an açık · 22:00'a kadar")
  })

  it('kapanış saatinden sonraysa kapalı döner', () => {
    const now = new Date(2026, 8, 7, 23, 0)
    const status = getOpenStatus(getTodayHours(hours, now), now)
    expect(status.isOpen).toBe(false)
    expect(status.label).toBe('Şu an kapalı')
  })

  it('gün kapalıysa (null) kapalı döner', () => {
    const now = new Date(2026, 8, 6, 12, 0)
    const status = getOpenStatus(getTodayHours(hours, now), now)
    expect(status.isOpen).toBe(false)
    expect(status.label).toBe('Şu an kapalı')
  })
})
```

- [ ] **Step 6: Testleri çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/hours.test.ts`
Expected: FAIL — `Cannot find module './hours'`

- [ ] **Step 7: `src/lib/hours.ts` implementasyonu**

```ts
// Çalışma saati / açık-kapalı hesaplama mantığı

export type Weekday = 'pazartesi' | 'sali' | 'carsamba' | 'persembe' | 'cuma' | 'cumartesi' | 'pazar'
export type DayHours = { open: string; close: string } | null
export type BusinessHours = Record<Weekday, DayHours>

const WEEKDAY_ORDER: Weekday[] = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi']

export function getTodayWeekday(now: Date = new Date()): Weekday {
  return WEEKDAY_ORDER[now.getDay()]
}

export function getTodayHours(hours: BusinessHours, now: Date = new Date()): DayHours {
  return hours[getTodayWeekday(now)]
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function getOpenStatus(dayHours: DayHours, now: Date = new Date()): { isOpen: boolean; label: string } {
  if (!dayHours) {
    return { isOpen: false, label: 'Şu an kapalı' }
  }
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = toMinutes(dayHours.open)
  const closeMinutes = toMinutes(dayHours.close)
  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes
  return {
    isOpen,
    label: isOpen ? `Şu an açık · ${dayHours.close}'a kadar` : 'Şu an kapalı',
  }
}
```

- [ ] **Step 8: Testleri çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/hours.test.ts`
Expected: PASS (5/5)

- [ ] **Step 9: Commit**

```bash
git add src/lib/utils.ts src/lib/utils.test.ts src/lib/hours.ts src/lib/hours.test.ts
git commit -m "feat: cn/formatPrice/formatTurkishDate/slugify ve açık-kapalı hesaplama mantığı"
```

---

### Task 3: `src/config/site.ts` ve `src/config/nav.ts`

**Files:**
- Create: `src/config/site.ts`
- Create: `src/config/nav.ts`

**Interfaces:**
- Consumes: `BusinessHours` tipi (`src/lib/hours.ts`, Task 2).
- Produces: `siteConfig` (varsayılan export değil, named export `siteConfig`) — alanlar: `brandName`, `siteUrl`, `restaurant: {name, phone, phoneDisplay, whatsapp, hours}`, `bufe: {name, phone, phoneDisplay, whatsapp, hours}`, `address: {line, mapEmbedUrl, directionsUrl, lat, lng}`, `social: {facebook, instagram, youtube, whatsapp}`, `showPrices: boolean`, `video: {splitPromo: string|null, trio: (string|null)[]}`. Sonraki TÜM görevler (Header, Footer, JSON-LD, /qr, /menu) bu alan adlarını birebir kullanır.
- Produces: `primaryNav: {label: string; href: string}[]`, `secondaryNav: {label: string; href: string}[]` (`src/config/nav.ts`).

- [ ] **Step 1: `src/config/site.ts` yaz**

```ts
// Tek kaynak: marka, işletme, iletişim ve saat bilgileri.
// Gerçek bilgiler netleşince yalnızca bu dosya güncellenir.
import type { BusinessHours } from '@/lib/hours'

const restaurantHours: BusinessHours = {
  pazartesi: { open: '08:00', close: '21:00' },
  sali: { open: '08:00', close: '21:00' },
  carsamba: { open: '08:00', close: '21:00' },
  persembe: { open: '08:00', close: '21:00' },
  cuma: { open: '08:00', close: '21:00' },
  cumartesi: { open: '08:00', close: '21:00' },
  pazar: { open: '09:00', close: '18:00' },
}

const bufeHours: BusinessHours = {
  pazartesi: { open: '07:00', close: '22:00' },
  sali: { open: '07:00', close: '22:00' },
  carsamba: { open: '07:00', close: '22:00' },
  persembe: { open: '07:00', close: '22:00' },
  cuma: { open: '07:00', close: '22:00' },
  cumartesi: { open: '07:00', close: '22:00' },
  pazar: { open: '08:00', close: '20:00' },
}

export const siteConfig = {
  brandName: 'EGEM',
  // TODO: müşteriden alınacak — gerçek domain bağlanınca güncellenecek
  siteUrl: 'https://www.egemtrak.com',
  restaurant: {
    name: 'EGEM-TRAK Restaurant',
    // TODO: müşteriden alınacak
    phone: '+902820000001',
    phoneDisplay: '0282 000 00 01',
    whatsapp: '905000000001',
    hours: restaurantHours,
  },
  bufe: {
    name: 'EGEM Büfe',
    // TODO: müşteriden alınacak
    phone: '+902820000002',
    phoneDisplay: '0282 000 00 02',
    whatsapp: '905000000002',
    hours: bufeHours,
  },
  address: {
    // TODO: müşteriden alınacak — tam adres
    line: 'Yeni Sanayi Bölgesi, Çorlu / Tekirdağ',
    // TODO: müşteriden alınacak — gerçek Google Maps embed linki
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d27.8014!3d41.1590',
    // TODO: müşteriden alınacak — gerçek yol tarifi linki
    directionsUrl: 'https://maps.google.com/?q=EGEM+Yeni+Sanayi+Bolgesi+Corlu',
    lat: 41.159,
    lng: 27.8014,
  },
  social: {
    // TODO: müşteriden alınacak
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
    whatsapp: 'https://wa.me/905000000001',
  },
  showPrices: true,
  video: {
    // TODO: müşteriden alınacak — YouTube video ID'si (boşsa play ikonu gizlenir)
    splitPromo: null as string | null,
    trio: [null, null, null] as (string | null)[],
  },
}
```

- [ ] **Step 2: `src/config/nav.ts` yaz**

```ts
// Header'ın sol ve sağ grup navigasyon linkleri ayrı ayrı tanımlanır.

export const primaryNav = [
  { label: 'ANASAYFA', href: '/' },
  { label: 'RESTAURANT', href: '/restaurant' },
  { label: 'BÜFE', href: '/bufe' },
]

export const secondaryNav = [
  { label: 'MENÜ', href: '/menu' },
  { label: 'HAKKIMIZDA', href: '/hakkimizda' },
  { label: 'İLETİŞİM', href: '/iletisim' },
]
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 4: Commit**

```bash
git add src/config/site.ts src/config/nav.ts
git commit -m "feat: site.ts ve nav.ts config dosyaları"
```

---

### Task 4: `src/config/images.ts` — görsel slot kaydı

**Files:**
- Create: `src/config/images.ts`

**Interfaces:**
- Produces: `type ImageSlot = { key: string; src: string | null; alt: string; ratio: string; recommended: string; note: string; priority?: boolean }`; `imageSlots: Record<string, ImageSlot>` (key = spot adı, örn. `'hero.slide1'`). `SmartImage` bileşeni (Task 9) bu kayıttan okur.

- [ ] **Step 1: `src/config/images.ts` yaz**

```ts
// Sitedeki HER görsel buradan gelir. Görsel eklemek için:
// 1) Dosyayı /public/images/<klasör>/ içine at
// 2) Aşağıda ilgili slot'un `src` değerini doldur
// 3) Başka hiçbir dosyaya dokunma

export type ImageSlot = {
  key: string
  src: string | null
  alt: string
  ratio: string
  recommended: string
  note: string
  priority?: boolean
}

function slot(input: Omit<ImageSlot, 'src'>): ImageSlot {
  return { src: null, ...input }
}

export const imageSlots: Record<string, ImageSlot> = {
  'brand.logo': slot({ key: 'brand.logo', alt: 'EGEM logosu', ratio: '200/52', recommended: '400x104', note: 'Koyu zeminde kullanılacak logo (şeffaf PNG/SVG)' }),
  'brand.logoLight': slot({ key: 'brand.logoLight', alt: 'EGEM logosu (beyaz)', ratio: '200/52', recommended: '400x104', note: 'Şeffaf header için beyaz varyant logo' }),

  'hero.slide1': slot({ key: 'hero.slide1', alt: 'EGEM-TRAK Restaurant\'ta sıcak yemek servisi', ratio: '16/9', recommended: '1920x1080', note: 'Tezgahtan geniş çekim, sıcak ışık, dolu tabaklar', priority: true }),
  'hero.slide2': slot({ key: 'hero.slide2', alt: 'EGEM Büfe\'de hazırlanan tost ve sandviç', ratio: '16/9', recommended: '1920x1080', note: 'Büfe tezgahı, hızlı hazırlık anı, canlı renkler', priority: true }),

  'home.welcome.1': slot({ key: 'home.welcome.1', alt: 'Lokanta iç mekan görünümü', ratio: '3/4', recommended: '900x1200', note: 'Salon/masalar, sıcak atmosfer' }),
  'home.welcome.2': slot({ key: 'home.welcome.2', alt: 'Mutfaktan taze pişen yemek', ratio: '4/5', recommended: '900x1125', note: 'Aşçı elinden yemek, buğu/taze doku' }),
  'home.split.video': slot({ key: 'home.split.video', alt: 'Bugünün menüsü tanıtım videosu kapak görseli', ratio: '16/9', recommended: '1280x720', note: 'Video kapak karesi, oynat ikonu üstte gösterilecek' }),

  'home.featured.1': slot({ key: 'home.featured.1', alt: 'Mercimek çorbası', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, üstten açı, sade tabak' }),
  'home.featured.2': slot({ key: 'home.featured.2', alt: 'Kuru fasulye', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, pilav yanında' }),
  'home.featured.3': slot({ key: 'home.featured.3', alt: 'Zeytinyağlı taze fasulye', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, doğal ışık' }),
  'home.featured.4': slot({ key: 'home.featured.4', alt: 'Karışık ızgara', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, ızgara dokusu belirgin' }),
  'home.featured.5': slot({ key: 'home.featured.5', alt: 'Kaşarlı tost', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, kesit görünümü' }),
  'home.featured.6': slot({ key: 'home.featured.6', alt: 'Sütlaç', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, üstten açı' }),

  'home.mosaic.1': slot({ key: 'home.mosaic.1', alt: 'Restaurant salonu genel görünüm', ratio: '1/1', recommended: '900x900', note: 'Restaurant bandı arka planı' }),
  'home.mosaic.2': slot({ key: 'home.mosaic.2', alt: 'Günlük tabldot detay çekimi', ratio: '1/1', recommended: '900x900', note: 'Görsel ağırlıklı, sade kompozisyon' }),
  'home.mosaic.3': slot({ key: 'home.mosaic.3', alt: 'Büfe tezgahı genel görünüm', ratio: '1/1', recommended: '900x900', note: 'Büfe bandı arka planı' }),
  'home.mosaic.4': slot({ key: 'home.mosaic.4', alt: 'Toplu yemek servisi', ratio: '1/1', recommended: '900x900', note: 'Kumanya/toplu paket servis anı' }),

  'home.parallax': slot({ key: 'home.parallax', alt: 'Lokantanın dış cephesi', ratio: '21/9', recommended: '2400x1000', note: 'Geniş, sakin, markanın güven veren yüzü' }),

  'home.trio.1': slot({ key: 'home.trio.1', alt: 'Mutfaktan kısa video karesi 1', ratio: '4/3', recommended: '1200x900', note: 'Hazırlık anı, video kapak karesi' }),
  'home.trio.2': slot({ key: 'home.trio.2', alt: 'Mutfaktan kısa video karesi 2', ratio: '4/3', recommended: '1200x900', note: 'Servis anı, video kapak karesi' }),
  'home.trio.3': slot({ key: 'home.trio.3', alt: 'Mutfaktan kısa video karesi 3', ratio: '4/3', recommended: '1200x900', note: 'Müşteri memnuniyeti anı, video kapak karesi' }),

  'home.blockA.1': slot({ key: 'home.blockA.1', alt: 'Restaurant günlük tabldot çeşitleri', ratio: '3/4', recommended: '900x1200', note: 'Restaurant tanıtım bloğu üst görsel' }),
  'home.blockA.2': slot({ key: 'home.blockA.2', alt: 'Restaurant salon detayı', ratio: '4/5', recommended: '900x1125', note: 'Restaurant tanıtım bloğu alt görsel' }),
  'home.blockB.1': slot({ key: 'home.blockB.1', alt: 'Büfe hızlı servis anı', ratio: '3/4', recommended: '900x1200', note: 'Büfe tanıtım bloğu üst görsel' }),
  'home.blockB.2': slot({ key: 'home.blockB.2', alt: 'Büfe ürün detayı', ratio: '4/5', recommended: '900x1125', note: 'Büfe tanıtım bloğu alt görsel' }),

  'home.reviews.avatar.1': slot({ key: 'home.reviews.avatar.1', alt: 'Müşteri fotoğrafı 1', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar, yoksa baş harf dairesi gösterilir' }),
  'home.reviews.avatar.2': slot({ key: 'home.reviews.avatar.2', alt: 'Müşteri fotoğrafı 2', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.3': slot({ key: 'home.reviews.avatar.3', alt: 'Müşteri fotoğrafı 3', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.4': slot({ key: 'home.reviews.avatar.4', alt: 'Müşteri fotoğrafı 4', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.5': slot({ key: 'home.reviews.avatar.5', alt: 'Müşteri fotoğrafı 5', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.6': slot({ key: 'home.reviews.avatar.6', alt: 'Müşteri fotoğrafı 6', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),

  'home.gallery.1': slot({ key: 'home.gallery.1', alt: 'Mekandan kare 1', ratio: '4/3', recommended: '1200x900', note: 'Salon genel görünüm' }),
  'home.gallery.2': slot({ key: 'home.gallery.2', alt: 'Mekandan kare 2', ratio: '4/3', recommended: '1200x900', note: 'Mutfak/hazırlık anı' }),
  'home.gallery.3': slot({ key: 'home.gallery.3', alt: 'Mekandan kare 3', ratio: '4/3', recommended: '1200x900', note: 'Büfe tezgahı' }),
  'home.gallery.4': slot({ key: 'home.gallery.4', alt: 'Mekandan kare 4', ratio: '4/3', recommended: '1200x900', note: 'Yemek detay çekimi' }),
  'home.gallery.5': slot({ key: 'home.gallery.5', alt: 'Mekandan kare 5', ratio: '4/3', recommended: '1200x900', note: 'Müşteri/servis anı' }),
  'home.gallery.6': slot({ key: 'home.gallery.6', alt: 'Mekandan kare 6', ratio: '4/3', recommended: '1200x900', note: 'Dış cephe/giriş' }),

  'restaurant.hero': slot({ key: 'restaurant.hero', alt: 'EGEM-TRAK Restaurant sayfa üst görseli', ratio: '21/9', recommended: '2400x1000', note: 'Salon veya sıcak yemek geniş çekim', priority: true }),
  'restaurant.intro.1': slot({ key: 'restaurant.intro.1', alt: 'Restaurant tanıtım görseli 1', ratio: '4/5', recommended: '900x1125', note: 'Lokanta iç mekan' }),
  'restaurant.intro.2': slot({ key: 'restaurant.intro.2', alt: 'Restaurant tanıtım görseli 2', ratio: '4/5', recommended: '900x1125', note: 'Aşçı/mutfak' }),
  'restaurant.gallery.1': slot({ key: 'restaurant.gallery.1', alt: 'Restaurant galeri 1', ratio: '4/3', recommended: '1200x900', note: 'Salon' }),
  'restaurant.gallery.2': slot({ key: 'restaurant.gallery.2', alt: 'Restaurant galeri 2', ratio: '4/3', recommended: '1200x900', note: 'Tabldot çeşitleri' }),
  'restaurant.gallery.3': slot({ key: 'restaurant.gallery.3', alt: 'Restaurant galeri 3', ratio: '4/3', recommended: '1200x900', note: 'Mutfak' }),
  'restaurant.gallery.4': slot({ key: 'restaurant.gallery.4', alt: 'Restaurant galeri 4', ratio: '4/3', recommended: '1200x900', note: 'Müşteri anı' }),

  'bufe.hero': slot({ key: 'bufe.hero', alt: 'EGEM Büfe sayfa üst görseli', ratio: '21/9', recommended: '2400x1000', note: 'Büfe tezgahı geniş çekim, dinamik', priority: true }),
  'bufe.category.1': slot({ key: 'bufe.category.1', alt: 'Tostlar kategorisi', ratio: '4/3', recommended: '900x675', note: 'Kaşarlı tost, kesit' }),
  'bufe.category.2': slot({ key: 'bufe.category.2', alt: 'Sandviçler kategorisi', ratio: '4/3', recommended: '900x675', note: 'Sandviç detay' }),
  'bufe.category.3': slot({ key: 'bufe.category.3', alt: 'Sosisli & hamburger kategorisi', ratio: '4/3', recommended: '900x675', note: 'Hamburger detay' }),
  'bufe.category.4': slot({ key: 'bufe.category.4', alt: 'Kahvaltılık kategorisi', ratio: '4/3', recommended: '900x675', note: 'Omlet/menemen' }),
  'bufe.category.5': slot({ key: 'bufe.category.5', alt: 'Atıştırmalık kategorisi', ratio: '4/3', recommended: '900x675', note: 'Patates kızartması' }),
  'bufe.category.6': slot({ key: 'bufe.category.6', alt: 'İçecekler kategorisi', ratio: '4/3', recommended: '900x675', note: 'Soğuk içecek/çay' }),

  'about.hero': slot({ key: 'about.hero', alt: 'Hakkımızda sayfa üst görseli', ratio: '21/9', recommended: '2400x1000', note: 'Ekip veya mekan geniş çekim', priority: true }),
  'about.wide': slot({ key: 'about.wide', alt: 'Lokantamız hakkında geniş görünüm', ratio: '4/3', recommended: '1200x900', note: '"Lokantamız Hakkında" bloğunda görsel solda/metin sağda düzeninde kullanılır' }),
  'about.wideBand': slot({ key: 'about.wideBand', alt: 'Mekan ve ekip geniş görünüm', ratio: '16/9', recommended: '1920x1080', note: 'Değerler bölümünün altında tam genişlik bant, ekip/mekan birlikte' }),
  'about.gallery.1': slot({ key: 'about.gallery.1', alt: 'Hakkımızda galeri 1', ratio: '4/3', recommended: '1200x900', note: 'Mekan' }),
  'about.gallery.2': slot({ key: 'about.gallery.2', alt: 'Hakkımızda galeri 2', ratio: '4/3', recommended: '1200x900', note: 'Ekip' }),
  'about.gallery.3': slot({ key: 'about.gallery.3', alt: 'Hakkımızda galeri 3', ratio: '4/3', recommended: '1200x900', note: 'Mutfak' }),
  'about.gallery.4': slot({ key: 'about.gallery.4', alt: 'Hakkımızda galeri 4', ratio: '4/3', recommended: '1200x900', note: 'Yemek' }),
  'about.gallery.5': slot({ key: 'about.gallery.5', alt: 'Hakkımızda galeri 5', ratio: '4/3', recommended: '1200x900', note: 'Servis anı' }),
  'about.gallery.6': slot({ key: 'about.gallery.6', alt: 'Hakkımızda galeri 6', ratio: '4/3', recommended: '1200x900', note: 'Dış cephe' }),

  'contact.hero': slot({ key: 'contact.hero', alt: 'İletişim sayfa üst görseli', ratio: '21/9', recommended: '2400x600', note: 'İnce bant, sade/koyu görsel' }),

  'og.default': slot({ key: 'og.default', alt: 'EGEM-TRAK Restaurant & EGEM Büfe', ratio: '1200/630', recommended: '1200x630', note: 'Sosyal paylaşım kapak görseli, logo + marka rengi zemin' }),
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/config/images.ts
git commit -m "feat: gorsel slot kaydi (images.ts)"
```

---

### Task 5: `src/data/menu.ts` — Restaurant menü verisi (≥45 kalem)

**Files:**
- Create: `src/data/menu.ts`
- Test: `src/data/menu.test.ts`

**Interfaces:**
- Produces: `type MenuTag = 'acili' | 'vejetaryen' | 'yeni' | 'gunun-yemegi'`; `type MenuItem = { name: string; desc?: string; price?: number; tags?: MenuTag[]; image?: string | null }`; `type MenuCategory = { key: string; title: string; items: MenuItem[] }`; `restaurantMenu: MenuCategory[]`; `todaysSpecial: { note: string; items: string[] }`.

- [ ] **Step 1: `src/data/menu.test.ts` — asgari içerik testleri yaz**

```ts
import { describe, it, expect } from 'vitest'
import { restaurantMenu, todaysSpecial } from './menu'

describe('restaurantMenu', () => {
  it('toplam en az 45 kalem içerir', () => {
    const total = restaurantMenu.reduce((sum, cat) => sum + cat.items.length, 0)
    expect(total).toBeGreaterThanOrEqual(45)
  })

  it('8 kategori içerir ve her kategorinin en az 1 ürünü var', () => {
    expect(restaurantMenu).toHaveLength(8)
    restaurantMenu.forEach((cat) => expect(cat.items.length).toBeGreaterThan(0))
  })

  it('her kategori benzersiz bir key taşır', () => {
    const keys = restaurantMenu.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('todaysSpecial', () => {
  it('bugünün tabldotunda en az 3 ürün adı bulunur ve bu adlar menüde geçer', () => {
    expect(todaysSpecial.items.length).toBeGreaterThanOrEqual(3)
    const allNames = restaurantMenu.flatMap((c) => c.items.map((i) => i.name))
    todaysSpecial.items.forEach((name) => expect(allNames).toContain(name))
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/data/menu.test.ts`
Expected: FAIL — `Cannot find module './menu'`

- [ ] **Step 3: `src/data/menu.ts` — gerçek içerikle doldur**

```ts
// EGEM-TRAK Restaurant menü verisi.
// Fiyatlar örnek/makuldür.
// TODO: fiyatlar müşteriden teyit edilecek

export type MenuTag = 'acili' | 'vejetaryen' | 'yeni' | 'gunun-yemegi'

export type MenuItem = {
  name: string
  desc?: string
  price?: number
  tags?: MenuTag[]
  image?: string | null
}

export type MenuCategory = {
  key: string
  title: string
  items: MenuItem[]
}

export const restaurantMenu: MenuCategory[] = [
  {
    key: 'corbalar',
    title: 'Çorbalar',
    items: [
      { name: 'Mercimek Çorbası', price: 60, tags: ['gunun-yemegi'], image: null },
      { name: 'Ezogelin Çorbası', price: 60, image: null },
      { name: 'Yayla Çorbası', desc: 'Yoğurtlu, nane tereyağlı', price: 65, image: null },
      { name: 'Domates Çorbası', price: 60, tags: ['vejetaryen'], image: null },
      { name: 'Tavuk Suyu Çorba', price: 65, image: null },
      { name: 'Şehriye Çorbası', price: 60, image: null },
    ],
  },
  {
    key: 'sulu-yemekler',
    title: 'Sulu Yemekler',
    items: [
      { name: 'Kuru Fasulye', desc: 'Pirinç pilavı ile servis edilir', price: 130, tags: ['gunun-yemegi'], image: null },
      { name: 'Etli Nohut', price: 130, image: null },
      { name: 'Karnıyarık', price: 150, image: null },
      { name: 'Türlü', desc: 'Mevsim sebzeleriyle', price: 140, tags: ['vejetaryen'], image: null },
      { name: 'Etli Taze Fasulye', price: 145, image: null },
      { name: 'Patlıcan Musakka', price: 145, image: null },
      { name: 'Etli Bamya', price: 155, image: null },
      { name: 'Kıymalı Ispanak', price: 130, image: null },
      { name: 'Etli Kabak', price: 135, image: null },
      { name: 'Hünkar Beğendi', desc: 'Közlenmiş patlıcan püresi üzerinde et', price: 175, image: null },
    ],
  },
  {
    key: 'izgara-ana-yemek',
    title: 'Izgara & Ana Yemek',
    items: [
      { name: 'Izgara Köfte', price: 190, image: null },
      { name: 'Tavuk Şiş', price: 175, image: null },
      { name: 'Adana Kebap', price: 220, tags: ['acili'], image: null },
      { name: 'Izgara Tavuk But', price: 165, image: null },
      { name: 'Bonfile', price: 260, tags: ['yeni'], image: null },
      { name: 'Karışık Izgara', desc: 'Köfte, tavuk şiş, kanat', price: 250, image: null },
      { name: 'Kaburga', price: 240, image: null },
    ],
  },
  {
    key: 'zeytinyaglilar',
    title: 'Zeytinyağlılar',
    items: [
      { name: 'Zeytinyağlı Taze Fasulye', price: 110, tags: ['vejetaryen'], image: null },
      { name: 'Zeytinyağlı Barbunya', price: 110, tags: ['vejetaryen'], image: null },
      { name: 'Zeytinyağlı Enginar', price: 140, tags: ['vejetaryen'], image: null },
      { name: 'Yaprak Sarma', price: 120, tags: ['vejetaryen'], image: null },
      { name: 'İmam Bayıldı', price: 125, tags: ['vejetaryen'], image: null },
      { name: 'Zeytinyağlı Pırasa', price: 110, tags: ['vejetaryen'], image: null },
    ],
  },
  {
    key: 'pilav-makarna',
    title: 'Pilav & Makarna',
    items: [
      { name: 'Sade Pirinç Pilavı', price: 60, tags: ['vejetaryen'], image: null },
      { name: 'Bulgur Pilavı', price: 55, tags: ['vejetaryen'], image: null },
      { name: 'Şehriyeli Pilav', price: 60, tags: ['vejetaryen'], image: null },
      { name: 'Fırın Makarna', price: 90, image: null },
      { name: 'Nohutlu Pilav', price: 75, tags: ['vejetaryen'], image: null },
      { name: 'Domatesli Erişte', price: 70, tags: ['vejetaryen'], image: null },
    ],
  },
  {
    key: 'salata-meze',
    title: 'Salata & Meze',
    items: [
      { name: 'Çoban Salata', price: 70, tags: ['vejetaryen'], image: null },
      { name: 'Mevsim Salata', price: 65, tags: ['vejetaryen'], image: null },
      { name: 'Cacık', price: 55, tags: ['vejetaryen'], image: null },
      { name: 'Patlıcan Salatası', price: 75, tags: ['vejetaryen'], image: null },
      { name: 'Közlenmiş Biber Salatası', price: 75, tags: ['vejetaryen', 'acili'], image: null },
    ],
  },
  {
    key: 'tatlilar',
    title: 'Tatlılar',
    items: [
      { name: 'Sütlaç', price: 75, image: null },
      { name: 'Kemalpaşa Tatlısı', price: 80, image: null },
      { name: 'Kazandibi', price: 80, image: null },
      { name: 'Revani', price: 70, image: null },
      { name: 'Aşure', desc: 'Mevsimlik', price: 75, image: null },
    ],
  },
  {
    key: 'icecekler',
    title: 'İçecekler',
    items: [
      { name: 'Ayran', price: 30, tags: ['vejetaryen'], image: null },
      { name: 'Şalgam', price: 35, image: null },
      { name: 'Soda', price: 25, image: null },
      { name: 'Kola / Gazoz', price: 40, image: null },
      { name: 'Çay', price: 15, image: null },
    ],
  },
]

export const todaysSpecial: { note: string; items: string[] } = {
  note: 'Her gün taze pişer, günlük olarak güncellenir.',
  items: ['Mercimek Çorbası', 'Kuru Fasulye', 'Sade Pirinç Pilavı', 'Ayran'],
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/data/menu.test.ts`
Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add src/data/menu.ts src/data/menu.test.ts
git commit -m "feat: restaurant menu verisi (50 kalem, 8 kategori)"
```

---

### Task 6: `src/data/bufe.ts` — Büfe menü verisi (≥25 kalem)

**Files:**
- Create: `src/data/bufe.ts`
- Test: `src/data/bufe.test.ts`

**Interfaces:**
- Consumes: `MenuTag`, `MenuItem`, `MenuCategory` tipleri (`src/data/menu.ts`, Task 5).
- Produces: `bufeMenu: MenuCategory[]`.

- [ ] **Step 1: `src/data/bufe.test.ts` yaz**

```ts
import { describe, it, expect } from 'vitest'
import { bufeMenu } from './bufe'

describe('bufeMenu', () => {
  it('toplam en az 25 kalem içerir', () => {
    const total = bufeMenu.reduce((sum, cat) => sum + cat.items.length, 0)
    expect(total).toBeGreaterThanOrEqual(25)
  })

  it('6 kategori içerir', () => {
    expect(bufeMenu).toHaveLength(6)
  })

  it('her kategori benzersiz bir key taşır', () => {
    const keys = bufeMenu.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/data/bufe.test.ts`
Expected: FAIL — `Cannot find module './bufe'`

- [ ] **Step 3: `src/data/bufe.ts` yaz**

```ts
// EGEM Büfe menü verisi.
// TODO: fiyatlar müşteriden teyit edilecek
import type { MenuCategory } from './menu'

export const bufeMenu: MenuCategory[] = [
  {
    key: 'tostlar',
    title: 'Tostlar',
    items: [
      { name: 'Kaşarlı Tost', price: 70, image: null },
      { name: 'Karışık Tost', desc: 'Kaşar, sucuk, salam', price: 90, image: null },
      { name: 'Sucuklu Tost', price: 85, image: null },
      { name: 'Ayvalık Tostu', desc: 'Sucuk, sosis, kaşar, salam, turşu', price: 110, tags: ['yeni'], image: null },
      { name: 'Kaşarlı Sucuklu Tost', price: 90, image: null },
      { name: 'Tavuklu Tost', price: 90, image: null },
    ],
  },
  {
    key: 'sandvicler',
    title: 'Sandviçler',
    items: [
      { name: 'Tavuklu Sandviç', price: 110, image: null },
      { name: 'Izgara Köfte Sandviç', price: 120, image: null },
      { name: 'Ton Balıklı Sandviç', price: 115, image: null },
      { name: 'Sote Kaşarlı Sandviç', price: 100, tags: ['vejetaryen'], image: null },
      { name: 'Sebzeli Sandviç', price: 90, tags: ['vejetaryen'], image: null },
    ],
  },
  {
    key: 'sosisli-hamburger',
    title: 'Sosisli & Hamburger',
    items: [
      { name: 'Klasik Sosisli', price: 75, image: null },
      { name: 'Kaşarlı Sosisli', price: 90, image: null },
      { name: 'Klasik Hamburger', price: 110, image: null },
      { name: 'Kaşarlı Hamburger', price: 125, image: null },
      { name: 'Acılı Hamburger', price: 130, tags: ['acili'], image: null },
    ],
  },
  {
    key: 'kahvaltilik',
    title: 'Kahvaltılık',
    items: [
      { name: 'Sade Omlet', price: 80, tags: ['vejetaryen'], image: null },
      { name: 'Kaşarlı Omlet', price: 95, tags: ['vejetaryen'], image: null },
      { name: 'Sucuklu Yumurta', price: 100, image: null },
      { name: 'Menemen', price: 95, tags: ['vejetaryen'], image: null },
    ],
  },
  {
    key: 'atistirmalik',
    title: 'Atıştırmalık',
    items: [
      { name: 'Patates Kızartması', price: 70, tags: ['vejetaryen'], image: null },
      { name: 'Soğan Halkası', price: 75, tags: ['vejetaryen'], image: null },
      { name: 'Mozarella Çubuğu', price: 85, tags: ['vejetaryen'], image: null },
      { name: 'Çıtır Tavuk', price: 95, image: null },
    ],
  },
  {
    key: 'icecekler',
    title: 'İçecekler',
    items: [
      { name: 'Çay', price: 15, image: null },
      { name: 'Türk Kahvesi', price: 40, image: null },
      { name: 'Ayran', price: 30, image: null },
      { name: 'Soğuk İçecek (Kutu)', price: 45, image: null },
      { name: 'Su', price: 15, image: null },
    ],
  },
]
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/data/bufe.test.ts`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/data/bufe.ts src/data/bufe.test.ts
git commit -m "feat: bufe menu verisi (29 kalem, 6 kategori)"
```

---

### Task 7: `src/data/faq.ts`, `src/data/reviews.ts`, `src/data/features.ts`

**Files:**
- Create: `src/data/faq.ts`, `src/data/reviews.ts`, `src/data/features.ts`

**Interfaces:**
- Produces: `faqs: { question: string; answer: string }[]` (6 kalem); `reviews: { name: string; rating: number; date: string; text: string }[]` (6 kalem); `features: { icon: 'leaf' | 'shield-check' | 'timer' | 'wallet'; title: string; desc: string }[]` (4 kalem — icon adları `lucide-react` bileşen adlarına karşılık gelir, Task 8'de kullanılacak).

- [ ] **Step 1: `src/data/faq.ts` yaz**

```ts
// Sık sorulan sorular

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'Çalışma saatleriniz nedir?',
    answer: 'EGEM-TRAK Restaurant hafta içi 08:00-21:00, Pazar 09:00-18:00 arası; EGEM Büfe hafta içi 07:00-22:00, Pazar 08:00-20:00 arası hizmet verir. Güncel saatler anasayfada canlı olarak gösterilir.',
  },
  {
    question: 'Toplu sipariş / kumanya hizmeti veriyor musunuz?',
    answer: 'Evet, sanayi bölgesindeki işletmelere günlük öğle yemeği ve toplu paket servis hizmeti sunuyoruz. Detaylar için WhatsApp hattımızdan bize ulaşabilirsiniz.',
  },
  {
    question: 'Paket servis / eve teslim yapıyor musunuz?',
    answer: 'Paket servisimiz mevcuttur. Sipariş için telefon veya WhatsApp hattımızı kullanabilirsiniz.',
  },
  {
    question: 'Otopark imkanınız var mı?',
    answer: 'Sanayi bölgesindeki konumumuzda araç park edebileceğiniz alan bulunmaktadır.',
  },
  {
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Nakit ve banka/kredi kartı ile ödeme kabul edilmektedir.',
  },
  {
    question: 'Alerjen bilgisi alabilir miyim?',
    answer: 'Ürünlerimizdeki alerjen bilgisi için masanızdaki personelimize danışabilir veya telefonla bize ulaşabilirsiniz.',
  },
]
```

- [ ] **Step 2: `src/data/reviews.ts` yaz**

```ts
// Müşteri yorumları
// TODO: gerçek Google yorumları eklenecek

export const reviews: { name: string; rating: number; date: string; text: string; avatar?: string | null }[] = [
  { name: 'Murat K.', rating: 5, date: '2026-08', text: 'Sanayi bölgesinde çalışıyorum, her gün buradan yemek yiyorum. Ev yemeği tadında, doyurucu ve uygun fiyatlı.', avatar: null },
  { name: 'Ayşe T.', rating: 5, date: '2026-07', text: 'Kuru fasulyesi gerçekten çok lezzetli. Personel de çok ilgili, servis hızlı.', avatar: null },
  { name: 'Serkan D.', rating: 4, date: '2026-07', text: 'TIR şoförüyüm, bölgeye her geldiğimde uğruyorum. Temiz ve hızlı, tavsiye ederim.', avatar: null },
  { name: 'Elif Y.', rating: 5, date: '2026-06', text: 'Büfe tarafındaki tostları çok seviyorum, hızlı hazırlanıyor ve sıcacık geliyor.', avatar: null },
  { name: 'Hakan B.', rating: 5, date: '2026-06', text: 'Ofis olarak toplu yemek siparişi veriyoruz, hiç sorun yaşamadık. Teşekkürler EGEM ekibi.', avatar: null },
  { name: 'Zeynep A.', rating: 4, date: '2026-05', text: 'Günlük menü her gün değişiyor, bu da güzel bir çeşitlilik sağlıyor. Fiyatlar da makul.', avatar: null },
]
```

- [ ] **Step 3: `src/data/features.ts` yaz**

```ts
// "Neden EGEM" maddeleri — Hakkımızda sayfasında 4 ikonlu değer olarak kullanılır.

export const features: { icon: 'leaf' | 'shield-check' | 'timer' | 'wallet'; title: string; desc: string }[] = [
  { icon: 'leaf', title: 'Her Gün Taze Pişer', desc: 'Menümüz günlük olarak hazırlanır, bir gün önceden kalan yemek servis edilmez.' },
  { icon: 'shield-check', title: 'Temiz Mutfak', desc: 'Hijyen standartlarına titizlikle uyan bir mutfakta çalışıyoruz.' },
  { icon: 'timer', title: 'Hızlı Servis', desc: 'Yoğun sanayi bölgesi temposuna uygun, hızlı ve düzenli servis sağlıyoruz.' },
  { icon: 'wallet', title: 'Uygun Fiyat', desc: 'Kaliteden ödün vermeden, herkesin bütçesine uygun fiyatlarla hizmet veriyoruz.' },
]
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 5: Commit**

```bash
git add src/data/faq.ts src/data/reviews.ts src/data/features.ts
git commit -m "feat: faq, reviews ve features veri dosyalari"
```

---

### Task 8: UI kiti temel bileşenler — Container, Section, Button, Badge, SectionTitle

**Files:**
- Create: `src/components/ui/Container.tsx`, `src/components/ui/Section.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/SectionTitle.tsx`

**Interfaces:**
- Produces: `<Container className?>`, `<Section tone?: 'white'|'brand-50'|'brand-900'|'brand-950' id? className?>`, `<Button href? onClick? variant?: 'solid'|'outline'|'outline-light' type? className?>`, `<Badge tag: MenuTag className?>`, `<SectionTitle kicker? lead strong subtitle? align?: 'left'|'center' light? />`. Bu 5 bileşen Faz 2-5'teki tüm section/page dosyalarında kullanılır.
- Consumes: `cn` (`src/lib/utils.ts`, Task 2).

- [ ] **Step 1: `src/components/ui/Container.tsx`**

```tsx
import { cn } from '@/lib/utils'

export default function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-container px-5 lg:px-8', className)}>{children}</div>
}
```

- [ ] **Step 2: `src/components/ui/Section.tsx`**

```tsx
import { cn } from '@/lib/utils'

type SectionProps = {
  children: React.ReactNode
  className?: string
  tone?: 'white' | 'brand-50' | 'brand-900' | 'brand-950'
  id?: string
}

const toneClasses: Record<NonNullable<SectionProps['tone']>, string> = {
  white: 'bg-white',
  'brand-50': 'bg-brand-50',
  'brand-900': 'bg-brand-900 text-white',
  'brand-950': 'bg-brand-950 text-white',
}

export default function Section({ children, className, tone = 'white', id }: SectionProps) {
  return (
    <section id={id} className={cn('py-14 lg:py-24', toneClasses[tone], className)}>
      {children}
    </section>
  )
}
```

- [ ] **Step 3: `src/components/ui/Button.tsx`**

```tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonProps = {
  href?: string
  onClick?: () => void
  variant?: 'solid' | 'outline' | 'outline-light'
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  solid: 'bg-brand-500 text-white hover:bg-brand-600',
  outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50',
  'outline-light': 'border border-white text-white hover:bg-white/10',
}

export default function Button({ href, onClick, variant = 'solid', children, className, type = 'button' }: ButtonProps) {
  const classes = cn(
    'inline-flex min-h-[44px] items-center justify-center rounded-btn px-6 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-200',
    variantClasses[variant],
    className
  )
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: `src/components/ui/Badge.tsx`**

```tsx
import { cn } from '@/lib/utils'
import type { MenuTag } from '@/data/menu'

const badgeStyles: Record<MenuTag, string> = {
  acili: 'bg-red-50 text-red-600',
  vejetaryen: 'bg-green-50 text-green-700',
  yeni: 'bg-brand-100 text-brand-700',
  'gunun-yemegi': 'bg-accent-500/15 text-accent-500',
}

const badgeLabels: Record<MenuTag, string> = {
  acili: 'Acılı',
  vejetaryen: 'Vejetaryen',
  yeni: 'Yeni',
  'gunun-yemegi': 'Günün Yemeği',
}

export default function Badge({ tag, className }: { tag: MenuTag; className?: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', badgeStyles[tag], className)}>
      {badgeLabels[tag]}
    </span>
  )
}
```

- [ ] **Step 5: `src/components/ui/SectionTitle.tsx`**

```tsx
import { cn } from '@/lib/utils'

type SectionTitleProps = {
  kicker?: string
  lead: string
  strong: string
  subtitle?: string
  align?: 'left' | 'center'
  light?: boolean
}

export default function SectionTitle({ kicker, lead, strong, subtitle, align = 'center', light = false }: SectionTitleProps) {
  return (
    <div className={cn('flex flex-col gap-3', align === 'center' ? 'items-center text-center' : 'items-start text-left')}>
      {kicker && <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">{kicker}</span>}
      <h2 className={cn('font-display text-[26px] leading-[1.2] lg:text-[44px]', light ? 'text-white' : 'text-ink')}>
        <span className="font-normal">{lead} </span>
        <span className="font-extrabold">{strong}</span>
      </h2>
      {subtitle && (
        <p className={cn('max-w-[65ch] text-[17px] leading-[1.65]', light ? 'text-white/80' : 'text-ink-soft')}>{subtitle}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Container.tsx src/components/ui/Section.tsx src/components/ui/Button.tsx src/components/ui/Badge.tsx src/components/ui/SectionTitle.tsx
git commit -m "feat: temel ui kiti (Container, Section, Button, Badge, SectionTitle)"
```

---

### Task 9: `ui/SmartImage` — görsel slot render bileşeni (hafif TDD)

**Files:**
- Create: `src/components/ui/SmartImage.tsx`, `src/components/ui/SmartImage.test.tsx`

**Interfaces:**
- Consumes: `imageSlots` (`src/config/images.ts`, Task 4), `cn` (Task 2).
- Produces: `<SmartImage slot: string className? sizes? dark? />`. Sonraki TÜM görsel kullanan bileşenler (Header, Footer, tüm sections, tüm sayfalar) bunu kullanır — component içine doğrudan `<Image src="/images/...">` yazılmaz.

- [ ] **Step 1: `src/components/ui/SmartImage.test.tsx` — başarısız testleri yaz**

```tsx
import type { ComponentProps } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SmartImage from './SmartImage'

vi.mock('next/image', () => ({
  default: (props: ComponentProps<'img'>) => <img {...props} alt={props.alt} />,
}))

vi.mock('@/config/images', () => ({
  imageSlots: {
    'test.empty': { key: 'test.empty', src: null, alt: 'Boş görsel', ratio: '1/1', recommended: '600x600', note: 'Not' },
    'test.filled': { key: 'test.filled', src: '/images/test.jpg', alt: 'Dolu görsel', ratio: '1/1', recommended: '600x600', note: 'Not' },
  },
}))

describe('SmartImage', () => {
  it('src null iken markalı placeholder gösterir, img render etmez', () => {
    render(<SmartImage slot="test.empty" />)
    expect(screen.getByText('test.empty')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('src doluyken next/image ile görseli render eder', () => {
    render(<SmartImage slot="test.filled" />)
    expect(screen.getByAltText('Dolu görsel')).toBeInTheDocument()
  })

  it('bilinmeyen slot için hata fırlatır', () => {
    expect(() => render(<SmartImage slot="test.yok" />)).toThrow()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/ui/SmartImage.test.tsx`
Expected: FAIL — `Cannot find module './SmartImage'`

- [ ] **Step 3: `src/components/ui/SmartImage.tsx` implementasyonu**

```tsx
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { imageSlots } from '@/config/images'
import { cn } from '@/lib/utils'

type SmartImageProps = {
  slot: string
  className?: string
  sizes?: string
  dark?: boolean
}

export default function SmartImage({ slot, className, sizes = '100vw', dark = false }: SmartImageProps) {
  const data = imageSlots[slot]
  if (!data) {
    throw new Error(`Bilinmeyen görsel slotu: ${slot}`)
  }

  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={{ aspectRatio: data.ratio }}>
      {data.src ? (
        <Image src={data.src} alt={data.alt} fill sizes={sizes} priority={data.priority} className="object-cover" />
      ) : (
        <div
          className={cn(
            'flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[length:14px_14px] p-4 text-center',
            dark ? 'bg-brand-900 text-white/60' : 'bg-brand-100 text-brand-700/60'
          )}
        >
          <ImageIcon className="h-8 w-8" aria-hidden="true" />
          <span className="text-xs font-medium">{data.key}</span>
          <span className="text-[11px] opacity-70">{data.recommended}</span>
        </div>
      )}
    </div>
  )
}
```

Not: `SmartImage` kendi başına köşe yuvarlatma uygulamaz (yalnızca `overflow-hidden`). Spec'in "görsel rounded-lg" kuralı gereği köşe yuvarlatması gereken tekil kullanımlarda çağıran taraf `className="rounded-lg"` ekler (örn. Featured kartları, galeri); tam genişlik/kenarsız kullanımlarda (Hero, Mosaic, Parallax) hiç eklenmez. `cn` basit bir string birleştirici olduğundan (tailwind-merge yok) çakışan `rounded-*` sınıfları asla aynı anda verilmez.

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/ui/SmartImage.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/SmartImage.tsx src/components/ui/SmartImage.test.tsx
git commit -m "feat: SmartImage gorsel slot bileseni"
```

---

### Task 10: `layout/MobileDrawer` — mobil tam ekran menü (hafif TDD)

**Files:**
- Create: `src/components/layout/MobileDrawer.tsx`, `src/components/layout/MobileDrawer.test.tsx`

**Interfaces:**
- Consumes: `primaryNav`, `secondaryNav` (Task 3), `siteConfig` (Task 3), `cn` (Task 2).
- Produces: `<MobileDrawer isOpen: boolean onClose: () => void />`. Task 11 (Header) bunu render eder.

- [ ] **Step 1: `src/components/layout/MobileDrawer.test.tsx` — başarısız testleri yaz**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileDrawer from './MobileDrawer'

describe('MobileDrawer', () => {
  it('isOpen false iken opacity-0 sınıfı taşır', () => {
    render(<MobileDrawer isOpen={false} onClose={() => {}} />)
    expect(screen.getByRole('dialog').className).toContain('opacity-0')
  })

  it('kapat butonuna tıklanınca onClose çağrılır', () => {
    const onClose = vi.fn()
    render(<MobileDrawer isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Menüyü kapat'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('ESC tuşuna basılınca onClose çağrılır', () => {
    const onClose = vi.fn()
    render(<MobileDrawer isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/layout/MobileDrawer.test.tsx`
Expected: FAIL — `Cannot find module './MobileDrawer'`

- [ ] **Step 3: `src/components/layout/MobileDrawer.tsx` implementasyonu**

```tsx
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
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/layout/MobileDrawer.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/MobileDrawer.tsx src/components/layout/MobileDrawer.test.tsx
git commit -m "feat: MobileDrawer bileseni"
```

---

### Task 11: `layout/Header` — bölünmüş, şeffaf/sticky header (hafif TDD)

**Files:**
- Create: `src/components/layout/Header.tsx`, `src/components/layout/Header.test.tsx`, `src/components/layout/Header.nonhome.test.tsx`

**Interfaces:**
- Consumes: `primaryNav`/`secondaryNav` (Task 3), `siteConfig` (Task 3), `SmartImage` (Task 9), `MobileDrawer` (Task 10), `cn` (Task 2).
- Produces: `<Header />` (prop almaz, `usePathname` ile anasayfa tespiti yapar). `src/app/layout.tsx` (Task 14) bunu render eder.

- [ ] **Step 1: `src/components/layout/Header.test.tsx` — anasayfa davranışı, başarısız test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('Header (anasayfa)', () => {
  it('başlangıçta şeffaf, 80px scroll sonrası koyu zemine geçer', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('bg-transparent')

    Object.defineProperty(window, 'scrollY', { value: 120, writable: true })
    fireEvent.scroll(window)

    expect(header.className).toContain('bg-brand-950')
  })
})
```

- [ ] **Step 2: `src/components/layout/Header.nonhome.test.tsx` — diğer sayfalar davranışı, başarısız test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/hakkimizda' }))

describe('Header (diğer sayfalar)', () => {
  it('anasayfa dışında baştan koyu zemin kullanır', () => {
    render(<Header />)
    expect(screen.getByRole('banner').className).toContain('bg-brand-950')
  })
})
```

- [ ] **Step 3: Testleri çalıştır, başarısız olduklarını doğrula**

Run: `npx vitest run src/components/layout/Header.test.tsx src/components/layout/Header.nonhome.test.tsx`
Expected: FAIL — `Cannot find module './Header'`

- [ ] **Step 4: `src/components/layout/Header.tsx` implementasyonu**

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Phone, Menu as MenuIcon } from 'lucide-react'
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

  useEffect(() => {
    if (!isHome) return
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

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
            <button aria-label="Ara" className="text-white">
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
          <button aria-label="Menüyü aç" onClick={() => setDrawerOpen(true)} className="text-white">
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link href="/" aria-label={siteConfig.brandName}>
            <SmartImage slot="brand.logoLight" className="h-9 w-[140px]" dark sizes="140px" />
          </Link>
          <a href={`tel:${siteConfig.restaurant.phone}`} aria-label="Ara" className="text-white">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
```

Not: `brand.logoLight` slotu boşken `SmartImage` markalı placeholder gösterir; bu, spec'in "görsel yoksa metin logo fallback'i" isteğini de görsel olarak karşılar (placeholder her zaman profesyonel görünür). `images.ts`'te `brand.logoLight.src` doldurulunca gerçek logo otomatik devreye girer.

- [ ] **Step 5: Testleri çalıştır, geçtiklerini doğrula**

Run: `npx vitest run src/components/layout/Header.test.tsx src/components/layout/Header.nonhome.test.tsx`
Expected: PASS (2/2)

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Header.test.tsx src/components/layout/Header.nonhome.test.tsx
git commit -m "feat: bolunmus header (seffaf/sticky + mobil drawer tetikleyici)"
```

---

### Task 12: `layout/MobileActionBar` ve `layout/ScrollTop`

**Files:**
- Create: `src/components/layout/MobileActionBar.tsx`, `src/components/layout/ScrollTop.tsx`

**Interfaces:**
- Consumes: `siteConfig` (Task 3), `cn` (Task 2).
- Produces: `<MobileActionBar />`, `<ScrollTop />` — ikisi de prop almaz, `src/app/layout.tsx` (Task 14) tarafından render edilir.

- [ ] **Step 1: `src/components/layout/MobileActionBar.tsx`**

```tsx
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
```

- [ ] **Step 2: `src/components/layout/ScrollTop.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ScrollTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Sayfa başına dön"
      className={cn(
        'fixed bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-md transition-opacity duration-200 lg:bottom-6',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/MobileActionBar.tsx src/components/layout/ScrollTop.tsx
git commit -m "feat: mobil alt bar ve yukari cik butonu"
```

---

### Task 13: `layout/Footer`

**Files:**
- Create: `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `siteConfig` (Task 3), `SmartImage` (Task 9), `Container` (Task 8).
- Produces: `<Footer />`, `src/app/layout.tsx` (Task 14) tarafından render edilir.

- [ ] **Step 1: `src/components/layout/Footer.tsx`**

```tsx
import { MapPin, Phone, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'
import SmartImage from '@/components/ui/SmartImage'
import Container from '@/components/ui/Container'

// `lucide-react` marka/logo ikonlarını (Facebook, Instagram, YouTube) artık paketten
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
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: footer bileseni"
```

---

### Task 14: Root layout kablolama, not-found, Faz 1 doğrulaması

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `Header` (Task 11), `Footer` (Task 13), `MobileActionBar`/`ScrollTop` (Task 12), `siteConfig` (Task 3).

- [ ] **Step 1: `src/app/layout.tsx`'i güncelle — Header/Footer/MobileActionBar/ScrollTop'u kabloya ekle**

```tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileActionBar from '@/components/layout/MobileActionBar'
import ScrollTop from '@/components/layout/ScrollTop'
import { siteConfig } from '@/config/site'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.restaurant.name} & ${siteConfig.bufe.name}`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: 'Çorlu Yeni Sanayi Bölgesi\'nde günlük tabldot ve hızlı lezzetler. Masanızdaki QR kodu okutarak menüyü hemen görün.',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: siteConfig.brandName,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="pb-16 font-sans text-ink antialiased lg:pb-0">
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileActionBar />
        <ScrollTop />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: `src/app/not-found.tsx`**

```tsx
import Link from 'next/link'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-24 text-center">
      <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">404</span>
      <h1 className="font-display text-3xl font-extrabold text-ink">Sayfa bulunamadı</h1>
      <p className="max-w-md text-ink-soft">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p>
      <Button href="/">Anasayfaya Dön</Button>
    </Container>
  )
}
```

- [ ] **Step 3: `src/app/page.tsx`'i geçici olarak sadeleştir (Faz 2'de section'larla doldurulacak)**

```tsx
export default function HomePage() {
  return (
    <div className="pt-16">
      <p className="p-8 text-center text-ink-soft">Anasayfa bölümleri Faz 2&apos;de eklenecek.</p>
    </div>
  )
}
```

- [ ] **Step 4: Faz 1 doğrulaması — build, lint, typecheck, tüm testler**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: Hepsi hatasız/PASS.

- [ ] **Step 5: Manuel doğrulama (dev server)**

Run: `npm run dev`

Tarayıcıda `http://localhost:3000` aç ve doğrula:
- Header şeffaf başlıyor (boş sayfa üzerinde koyu metin görünmese de header'ın `bg-transparent` olduğunu DevTools'tan kontrol et), 80px scroll sonrası `bg-brand-950`'ye geçiyor.
- Logo alanında markalı placeholder (kırık görsel YOK) görünüyor.
- 1024px altına indiğinde hamburger + drawer çalışıyor, drawer'da 6 link + Ara/WhatsApp/Yol Tarifi butonları var.
- Mobil genişlikte alt sabit bar (Menü/Ara/WhatsApp/Yol Tarifi) görünüyor, sayfa içeriği bu barın altında kalmıyor.
- 360px genişlikte yatay kaydırma yok.
- Footer'da adres/telefon/WhatsApp linkleri tıklanabilir ve doğru `tel:`/`wa.me`/maps URL'lerine gidiyor.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/not-found.tsx src/app/page.tsx
git commit -m "feat: root layout kablolamasi (header/footer/mobil bar), not-found sayfasi"
```

---

## Faz 2 — Anasayfa Bölümleri

### Task 15: `lib/useSlider` (tam TDD) ve `lib/useReveal` hook'ları

**Files:**
- Create: `src/lib/useSlider.ts`, `src/lib/useSlider.test.ts`
- Create: `src/lib/useReveal.ts`

**Interfaces:**
- Produces: `getNextIndex(current: number, count: number): number`, `getPrevIndex(current: number, count: number): number`, `useSlider(slideCount: number, intervalMs?: number): { index: number; next: () => void; prev: () => void; goTo: (i: number) => void }`. Task 18 (Hero) bunu kullanır.
- Produces: `useReveal<T extends HTMLElement>(): { ref: RefObject<T>; isVisible: boolean }`. Fade-up animasyonu isteyen tüm section'lar (ops.) kullanabilir.

- [ ] **Step 1: `src/lib/useSlider.test.ts` — başarısız testleri yaz**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { getNextIndex, getPrevIndex, useSlider } from './useSlider'

describe('getNextIndex / getPrevIndex', () => {
  it('son slayttan sonra başa döner', () => {
    expect(getNextIndex(1, 2)).toBe(0)
  })
  it('ilk slayttan öncesi sona döner', () => {
    expect(getPrevIndex(0, 2)).toBe(1)
  })
})

describe('useSlider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('belirtilen sürede otomatik bir sonraki slayta geçer', () => {
    const { result } = renderHook(() => useSlider(2, 1000))
    expect(result.current.index).toBe(0)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.index).toBe(1)
  })

  it('next/prev/goTo doğru index üretir', () => {
    const { result } = renderHook(() => useSlider(3, 1000))
    act(() => result.current.next())
    expect(result.current.index).toBe(1)
    act(() => result.current.prev())
    expect(result.current.index).toBe(0)
    act(() => result.current.goTo(2))
    expect(result.current.index).toBe(2)
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/useSlider.test.ts`
Expected: FAIL — `Cannot find module './useSlider'`

- [ ] **Step 3: `src/lib/useSlider.ts` implementasyonu**

```ts
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export function getNextIndex(current: number, count: number): number {
  return (current + 1) % count
}

export function getPrevIndex(current: number, count: number): number {
  return (current - 1 + count) % count
}

export function useSlider(slideCount: number, intervalMs = 6000) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setIndex((i) => getNextIndex(i, slideCount)), [slideCount])
  const prev = useCallback(() => setIndex((i) => getPrevIndex(i, slideCount)), [slideCount])
  const goTo = useCallback((i: number) => setIndex(((i % slideCount) + slideCount) % slideCount), [slideCount])

  useEffect(() => {
    if (slideCount <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timerRef.current = setInterval(next, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [index, slideCount, intervalMs, next])

  return { index, next, prev, goTo }
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/useSlider.test.ts`
Expected: PASS (4/4)

- [ ] **Step 5: `src/lib/useReveal.ts` — test gerektirmez (SmartImage/useActiveSection'daki IntersectionObserver deseninin doğrudan türevi), sadece typecheck ile doğrulanır**

```ts
'use client'
import { useEffect, useRef, useState } from 'react'

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 7: Commit**

```bash
git add src/lib/useSlider.ts src/lib/useSlider.test.ts src/lib/useReveal.ts
git commit -m "feat: useSlider ve useReveal hook'lari"
```

---

### Task 16: `ui/VideoModal` (hafif TDD)

**Files:**
- Create: `src/components/ui/VideoModal.tsx`, `src/components/ui/VideoModal.test.tsx`

**Interfaces:**
- Produces: `<VideoModal videoId: string | null triggerClassName? />`. `videoId` null ise hiçbir şey render etmez (play ikonu gizlenir). Task 20 (SplitPromo) ve Task 24 (TrioStrip) kullanır.

- [ ] **Step 1: `src/components/ui/VideoModal.test.tsx` — başarısız testleri yaz**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VideoModal from './VideoModal'

describe('VideoModal', () => {
  it('videoId null iken hiçbir şey render etmez', () => {
    const { container } = render(<VideoModal videoId={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('tetikleyiciye tıklanınca video açılır, ESC ile kapanır', () => {
    render(<VideoModal videoId="abc123" />)
    fireEvent.click(screen.getByLabelText('Videoyu oynat'))
    expect(screen.getByTitle('Video').getAttribute('src')).toContain('abc123')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTitle('Video')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/ui/VideoModal.test.tsx`
Expected: FAIL — `Cannot find module './VideoModal'`

- [ ] **Step 3: `src/components/ui/VideoModal.tsx` implementasyonu**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type VideoModalProps = {
  videoId: string | null
  triggerClassName?: string
}

export default function VideoModal({ videoId, triggerClassName }: VideoModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!videoId) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Videoyu oynat"
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-brand-500 shadow-md transition-transform duration-200 hover:scale-105',
          triggerClassName
        )}
      >
        <Play className="h-6 w-6 fill-current" aria-hidden="true" />
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Video oynatıcı" className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/90 p-4">
          <button onClick={() => setOpen(false)} aria-label="Kapat" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-white">
            <X className="h-7 w-7" aria-hidden="true" />
          </button>
          <div className="aspect-video w-full max-w-3xl">
            <iframe
              className="h-full w-full rounded-lg"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title="Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/ui/VideoModal.test.tsx`
Expected: PASS (2/2)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/VideoModal.tsx src/components/ui/VideoModal.test.tsx
git commit -m "feat: VideoModal bileseni"
```

---

### Task 17: `ui/Lightbox` (hafif TDD)

**Files:**
- Create: `src/components/ui/Lightbox.tsx`, `src/components/ui/Lightbox.test.tsx`

**Interfaces:**
- Consumes: `ImageSlot` tipi (Task 4).
- Produces: `<Lightbox images: ImageSlot[] activeIndex: number | null onClose: () => void onNavigate: (i: number) => void />` — kontrollü bileşen; galeri thumbnail grid'i ve `activeIndex` state'i çağıran section tarafından yönetilir. Task 27 (Gallery) kullanır.

- [ ] **Step 1: `src/components/ui/Lightbox.test.tsx` — başarısız testleri yaz**

```tsx
import type { ComponentProps } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import Lightbox from './Lightbox'
import type { ImageSlot } from '@/config/images'

vi.mock('next/image', () => ({
  default: (props: ComponentProps<'img'>) => <img {...props} alt={props.alt} />,
}))

const images: ImageSlot[] = [
  { key: 'a', src: '/a.jpg', alt: 'A görseli', ratio: '4/3', recommended: '1200x900', note: '' },
  { key: 'b', src: '/b.jpg', alt: 'B görseli', ratio: '4/3', recommended: '1200x900', note: '' },
]

describe('Lightbox', () => {
  it('activeIndex null iken hiçbir şey render etmez', () => {
    const { container } = render(<Lightbox images={images} activeIndex={null} onClose={() => {}} onNavigate={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sağ ok tuşu ile onNavigate bir sonraki indexle çağrılır', () => {
    const onNavigate = vi.fn()
    render(<Lightbox images={images} activeIndex={0} onClose={() => {}} onNavigate={onNavigate} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onNavigate).toHaveBeenCalledWith(1)
  })

  it('ESC ile onClose çağrılır', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} activeIndex={0} onClose={onClose} onNavigate={() => {}} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/ui/Lightbox.test.tsx`
Expected: FAIL — `Cannot find module './Lightbox'`

- [ ] **Step 3: `src/components/ui/Lightbox.tsx` implementasyonu**

```tsx
'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ImageSlot } from '@/config/images'

type LightboxProps = {
  images: ImageSlot[]
  activeIndex: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function Lightbox({ images, activeIndex, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    if (activeIndex === null) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate((activeIndex + 1) % images.length)
      if (e.key === 'ArrowLeft') onNavigate((activeIndex - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, images.length, onClose, onNavigate])

  if (activeIndex === null) return null
  const current = images[activeIndex]

  return (
    <div role="dialog" aria-modal="true" aria-label="Görsel galerisi" className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/90 p-4">
      <button onClick={onClose} aria-label="Kapat" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-white">
        <X className="h-7 w-7" aria-hidden="true" />
      </button>
      <button
        onClick={() => onNavigate((activeIndex - 1 + images.length) % images.length)}
        aria-label="Önceki görsel"
        className="absolute left-2 flex h-11 w-11 items-center justify-center text-white"
      >
        <ChevronLeft className="h-8 w-8" aria-hidden="true" />
      </button>
      <div className="relative aspect-[4/3] w-full max-w-3xl">
        {current.src ? (
          <Image src={current.src} alt={current.alt} fill className="object-contain" sizes="800px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-900 text-white/60">{current.key}</div>
        )}
      </div>
      <button
        onClick={() => onNavigate((activeIndex + 1) % images.length)}
        aria-label="Sonraki görsel"
        className="absolute right-2 flex h-11 w-11 items-center justify-center text-white"
      >
        <ChevronRight className="h-8 w-8" aria-hidden="true" />
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/ui/Lightbox.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Lightbox.tsx src/components/ui/Lightbox.test.tsx
git commit -m "feat: Lightbox bileseni"
```

---

### Task 18: `sections/Hero` — tam ekran slider

**Files:**
- Create: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `useSlider` (Task 15), `SmartImage` (Task 9), `Button` (Task 8), `getOpenStatus`/`getTodayHours` (Task 2), `siteConfig` (Task 3).
- Produces: `<Hero />`, prop almaz. Task 30 (page.tsx) render eder.

- [ ] **Step 1: `src/components/sections/Hero.tsx` implementasyonu**

```tsx
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
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: Hero slider bolumu"
```

---

### Task 19: `sections/Welcome` ve `sections/CenteredIntro`

**Files:**
- Create: `src/components/sections/Welcome.tsx`, `src/components/sections/CenteredIntro.tsx`

**Interfaces:**
- Consumes: `Container`, `Section`, `SectionTitle` (Task 8), `SmartImage` (Task 9).
- Produces: `<Welcome />`, `<CenteredIntro />` — prop almazlar.

- [ ] **Step 1: `src/components/sections/Welcome.tsx`**

```tsx
import SmartImage from '@/components/ui/SmartImage'
import Container from '@/components/ui/Container'

export default function Welcome() {
  return (
    <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-24">
      <div className="flex gap-4">
        <SmartImage slot="home.welcome.1" className="w-3/5 rounded-lg" />
        <SmartImage slot="home.welcome.2" className="w-2/5 rounded-lg lg:-mt-10" />
      </div>
      <div className="flex flex-col items-start gap-4 text-left">
        <svg width="48" height="16" viewBox="0 0 48 16" fill="none" aria-hidden="true" className="text-accent-500">
          <path d="M0 8H16M32 8H48M24 2L24 14" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">Hoş Geldiniz</span>
        <h2 className="font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">EGEM&apos;e Hoş Geldiniz</h2>
        <p className="max-w-[60ch] text-[17px] leading-[1.65] text-ink-soft">
          EGEM-TRAK Restaurant ve EGEM Büfe, Çorlu Yeni Sanayi Bölgesi&apos;nde tek çatı altında iki farklı ihtiyaca cevap
          veriyor. Restaurant tarafında her gün taze pişen ev yemekleri, büfe tarafında ise hızlı ve pratik lezzetler sizi
          bekliyor.
        </p>
        <p className="max-w-[60ch] text-[17px] leading-[1.65] text-ink-soft">
          Sanayi bölgesinin temposunu bilen bir ekip olarak, hem doyurucu bir öğle molası hem de aceleniz olduğunda hızlı
          bir seçenek sunmak için buradayız.
        </p>
        <div className="mt-2 h-px w-16 bg-line" />
      </div>
    </Container>
  )
}
```

- [ ] **Step 2: `src/components/sections/CenteredIntro.tsx`**

```tsx
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'

export default function CenteredIntro() {
  return (
    <Section tone="white">
      <Container className="mx-auto max-w-2xl">
        <SectionTitle
          kicker="Neden EGEM"
          lead="Aynı çatı altında"
          strong="iki güvenilir seçenek"
          subtitle="İster masaya oturup sıcak bir tabldot yemek isteyin, ister aceleyle bir şeyler atıştırıp yolunuza devam edin — EGEM ikisini de aynı özenle sunar."
          align="center"
        />
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Welcome.tsx src/components/sections/CenteredIntro.tsx
git commit -m "feat: Welcome ve CenteredIntro bolumleri"
```

---

### Task 20: `sections/SplitPromo`

**Files:**
- Create: `src/components/sections/SplitPromo.tsx`

**Interfaces:**
- Consumes: `Container`, `Section`, `Button` (Task 8), `SmartImage` (Task 9), `VideoModal` (Task 16), `siteConfig.video.splitPromo` (Task 3).

- [ ] **Step 1: `src/components/sections/SplitPromo.tsx`**

```tsx
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import SmartImage from '@/components/ui/SmartImage'
import VideoModal from '@/components/ui/VideoModal'
import { siteConfig } from '@/config/site'

export default function SplitPromo() {
  return (
    <Section tone="brand-50">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col items-start gap-4">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">Bugün Ne Var?</span>
          <h2 className="font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">
            Bugün tencerede
            <br />
            ne var?
          </h2>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/menu?tab=restaurant">Bugünün Menüsü</Button>
            <Button href="/restaurant" variant="outline">
              Restaurant
            </Button>
          </div>
        </div>
        <div className="relative">
          <SmartImage slot="home.split.video" className="rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoModal videoId={siteConfig.video.splitPromo} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/SplitPromo.tsx
git commit -m "feat: SplitPromo bolumu"
```

---

### Task 21: `sections/Featured` — Öne Çıkan Lezzetler (fiyatsız)

**Files:**
- Create: `src/components/sections/Featured.tsx`

**Interfaces:**
- Consumes: `Container`, `Section`, `SectionTitle`, `Button` (Task 8), `SmartImage` (Task 9).

- [ ] **Step 1: `src/components/sections/Featured.tsx`**

```tsx
import Link from 'next/link'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import Button from '@/components/ui/Button'
import SmartImage from '@/components/ui/SmartImage'

const featuredItems = [
  { slot: 'home.featured.1', name: 'Mercimek Çorbası', category: 'Çorba', href: '/menu?tab=restaurant#corbalar' },
  { slot: 'home.featured.2', name: 'Kuru Fasulye', category: 'Sulu Yemek', href: '/menu?tab=restaurant#sulu-yemekler' },
  { slot: 'home.featured.3', name: 'Zeytinyağlı Taze Fasulye', category: 'Zeytinyağlı', href: '/menu?tab=restaurant#zeytinyaglilar' },
  { slot: 'home.featured.4', name: 'Karışık Izgara', category: 'Izgara', href: '/menu?tab=restaurant#izgara-ana-yemek' },
  { slot: 'home.featured.5', name: 'Kaşarlı Tost', category: 'Tost', href: '/menu?tab=bufe#tostlar' },
  { slot: 'home.featured.6', name: 'Sütlaç', category: 'Tatlı', href: '/menu?tab=restaurant#tatlilar' },
] as const

export default function Featured() {
  return (
    <Section tone="white">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Menümüzden" lead="Öne Çıkan" strong="Lezzetler" subtitle="Her gün taze hazırlanan seçkimizden birkaç örnek." />
        <div className="grid w-full grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-8">
          {featuredItems.map((item) => (
            <Link key={item.slot} href={item.href} className="group flex flex-col items-center gap-3">
              <div className="w-full overflow-hidden rounded-lg">
                <SmartImage slot={item.slot} className="transition-transform duration-200 group-hover:scale-[1.03]" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-ink-soft">{item.category}</p>
              </div>
            </Link>
          ))}
        </div>
        <Button href="/menu" variant="outline">
          Tüm Menüyü Gör
        </Button>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Featured.tsx
git commit -m "feat: Featured (Ozgun Cikan Lezzetler, fiyatsiz) bolumu"
```

---

### Task 22: `sections/MosaicBanners`

**Files:**
- Create: `src/components/sections/MosaicBanners.tsx`

- [ ] **Step 1: `src/components/sections/MosaicBanners.tsx`**

```tsx
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
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/MosaicBanners.tsx
git commit -m "feat: MosaicBanners bolumu"
```

---

### Task 23: `sections/ParallaxSection`

**Files:**
- Create: `src/components/sections/ParallaxSection.tsx`

- [ ] **Step 1: `src/components/sections/ParallaxSection.tsx`**

```tsx
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import SmartImage from '@/components/ui/SmartImage'

export default function ParallaxSection() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden">
      <SmartImage slot="home.parallax" className="absolute inset-0 h-full" dark />
      <div className="absolute inset-0 bg-brand-950/60" />
      <Container className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center text-white">
        <h2 className="font-display text-[26px] font-extrabold leading-[1.2] lg:text-[44px]">
          <span className="font-normal">Yıllardır aynı</span> özenle
        </h2>
        <p className="max-w-md text-[17px] leading-[1.65] text-white/85">
          Sanayi bölgesinin gündelik temposuna, güvenilir ve tutarlı bir lezzet anlayışıyla eşlik ediyoruz.
        </p>
        <Button href="/hakkimizda" variant="outline-light">
          Hakkımızda
        </Button>
      </Container>
    </div>
  )
}
```

Not: Görsel `next/image` ile `fill` render edildiğinden CSS `background-attachment` uygulanamaz; spec'in izin verdiği "parallax hiç olmasın" seçeneği kullanılır — hareket efekti yoktur, bu yüzden mobil/masaüstü ayrımı gerekmez.

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ParallaxSection.tsx
git commit -m "feat: ParallaxSection bolumu"
```

---

### Task 24: `sections/TrioStrip`

**Files:**
- Create: `src/components/sections/TrioStrip.tsx`

**Interfaces:**
- Consumes: `VideoModal` (Task 16), `SmartImage` (Task 9), `siteConfig.video.trio` (Task 3).

- [ ] **Step 1: `src/components/sections/TrioStrip.tsx`**

```tsx
import Container from '@/components/ui/Container'
import SmartImage from '@/components/ui/SmartImage'
import VideoModal from '@/components/ui/VideoModal'
import { siteConfig } from '@/config/site'

const slots = ['home.trio.1', 'home.trio.2', 'home.trio.3'] as const

export default function TrioStrip() {
  return (
    <div className="relative z-10 -mt-14 bg-white pb-4 pt-6 lg:-mt-[60px]">
      <Container>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible" style={{ scrollSnapType: 'x mandatory' }}>
          {slots.map((slot, i) => (
            <div key={slot} className="relative min-w-[80%] shrink-0 overflow-hidden rounded-lg lg:min-w-0" style={{ scrollSnapAlign: 'start' }}>
              <SmartImage slot={slot} />
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoModal videoId={siteConfig.video.trio[i]} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/TrioStrip.tsx
git commit -m "feat: TrioStrip bolumu"
```

---

### Task 25: `sections/AltBlock` — ikili dönüşümlü tanıtım bloğu (yeniden kullanılabilir)

**Files:**
- Create: `src/components/sections/AltBlock.tsx`

**Interfaces:**
- Produces: `<AltBlock reverse? kicker title text primaryCta: {label, href} secondaryCta: {label, href} imageSlotTop: string imageSlotBottom: string />`. Task 30 (page.tsx) bunu Restaurant/Büfe verisiyle 2 kez render eder.

- [ ] **Step 1: `src/components/sections/AltBlock.tsx`**

```tsx
import SmartImage from '@/components/ui/SmartImage'
import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

type AltBlockProps = {
  reverse?: boolean
  kicker: string
  title: string
  text: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  imageSlotTop: string
  imageSlotBottom: string
}

export default function AltBlock({ reverse = false, kicker, title, text, primaryCta, secondaryCta, imageSlotTop, imageSlotBottom }: AltBlockProps) {
  return (
    <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-16">
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="flex gap-4">
          <SmartImage slot={imageSlotTop} className="w-3/5 rounded-lg" />
          <SmartImage slot={imageSlotBottom} className="w-2/5 rounded-lg lg:-mt-10" />
        </div>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent-500">{kicker}</span>
        <h2 className="mt-3 font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">{title}</h2>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-[1.65] text-ink-soft">{text}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
          <Button href={secondaryCta.href} variant="outline">
            {secondaryCta.label}
          </Button>
        </div>
      </div>
    </Container>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/AltBlock.tsx
git commit -m "feat: AltBlock (ikili donusumlu tanitim) bileseni"
```

---

### Task 26: `sections/Reviews`

**Files:**
- Create: `src/components/sections/Reviews.tsx`

**Interfaces:**
- Consumes: `reviews` (Task 7), `SmartImage` (Task 9), `Container`/`Section`/`SectionTitle` (Task 8).

- [ ] **Step 1: `src/components/sections/Reviews.tsx`**

```tsx
import { Star } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import { reviews } from '@/data/reviews'
import { cn } from '@/lib/utils'

const avatarSlots = [
  'home.reviews.avatar.1',
  'home.reviews.avatar.2',
  'home.reviews.avatar.3',
  'home.reviews.avatar.4',
  'home.reviews.avatar.5',
  'home.reviews.avatar.6',
] as const

export default function Reviews() {
  return (
    <Section tone="brand-50">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Bizi Değerlendirin" lead="Müşterilerimiz" strong="Ne Diyor?" />
        <div className="grid w-full gap-6 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <div key={review.name} className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-full">
                  <SmartImage slot={avatarSlots[i]} sizes="44px" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{review.name}</p>
                  <p className="text-xs text-ink-soft">{review.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5" aria-label={`${review.rating} üzerinden 5 yıldız`}>
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className={cn('h-4 w-4', starIndex < review.rating ? 'text-accent-500' : 'text-line')} fill="currentColor" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm leading-[1.6] text-ink-soft">{review.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Reviews.tsx
git commit -m "feat: Reviews bolumu"
```

---

### Task 27: `sections/Gallery`

**Files:**
- Create: `src/components/sections/Gallery.tsx`

**Interfaces:**
- Consumes: `Lightbox` (Task 17), `imageSlots` (Task 4), `SmartImage` (Task 9).

- [ ] **Step 1: `src/components/sections/Gallery.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import Lightbox from '@/components/ui/Lightbox'
import { imageSlots } from '@/config/images'

const gallerySlotKeys = ['home.gallery.1', 'home.gallery.2', 'home.gallery.3', 'home.gallery.4', 'home.gallery.5', 'home.gallery.6'] as const

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const images = gallerySlotKeys.map((key) => imageSlots[key])

  return (
    <Section tone="white">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Bir Bakış" lead="Mekânımızdan" strong="Kareler" />
        <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
          {gallerySlotKeys.map((key, i) => (
            <button key={key} onClick={() => setActiveIndex(i)} className="overflow-hidden rounded-lg text-left" aria-label={`${images[i].alt} - büyüt`}>
              <SmartImage slot={key} />
            </button>
          ))}
        </div>
      </Container>
      <Lightbox images={images} activeIndex={activeIndex} onClose={() => setActiveIndex(null)} onNavigate={setActiveIndex} />
    </Section>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Gallery.tsx
git commit -m "feat: Gallery bolumu (Lightbox entegrasyonu)"
```

---

### Task 28: `sections/LocationHours`

**Files:**
- Create: `src/components/sections/LocationHours.tsx`

**Interfaces:**
- Consumes: `siteConfig` (Task 3), `getTodayWeekday` (Task 2), `Button`/`Container`/`Section` (Task 8).

- [ ] **Step 1: `src/components/sections/LocationHours.tsx`**

```tsx
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
  const todayKey = getTodayWeekday()
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
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/LocationHours.tsx
git commit -m "feat: LocationHours bolumu"
```

---

### Task 29: `lib/qr.ts` (tam TDD) ve `sections/QrBand`

**Files:**
- Create: `src/lib/qr.ts`, `src/lib/qr.test.ts`
- Create: `src/components/sections/QrBand.tsx`

**Interfaces:**
- Produces: `generateQrSvg(url: string, options?: { margin?: number; color?: { dark?: string; light?: string } }): Promise<string>` — ham SVG markup string döner. Task 46/47 (Faz 5, `/qr` sayfası) de bunu kullanır.
- Produces: `<QrBand />` (async server component).

- [ ] **Step 1: `src/lib/qr.test.ts` — başarısız test yaz**

```ts
import { describe, it, expect } from 'vitest'
import { generateQrSvg } from './qr'

describe('generateQrSvg', () => {
  it('geçerli bir SVG string üretir', async () => {
    const svg = await generateQrSvg('https://example.com/menu')
    expect(svg).toContain('<svg')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/qr.test.ts`
Expected: FAIL — `Cannot find module './qr'`

- [ ] **Step 3: `src/lib/qr.ts` implementasyonu**

```ts
import QRCode from 'qrcode'

export async function generateQrSvg(
  url: string,
  options?: { margin?: number; color?: { dark?: string; light?: string } }
): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    margin: options?.margin ?? 1,
    color: {
      dark: options?.color?.dark ?? '#072138',
      light: options?.color?.light ?? '#ffffff',
    },
  })
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/qr.test.ts`
Expected: PASS (1/1)

- [ ] **Step 5: `src/components/sections/QrBand.tsx`**

```tsx
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/config/site'
import { generateQrSvg } from '@/lib/qr'

export default async function QrBand() {
  const svg = await generateQrSvg(`${siteConfig.siteUrl}/menu`)

  return (
    <div className="bg-brand-900 py-14 text-white">
      <Container className="flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-2xl font-extrabold lg:text-3xl">Masanızdaki QR kodu okutun</h2>
          <p className="mt-2 text-white/80">Güncel menümüze saniyeler içinde ulaşın.</p>
          <Button href="/menu" className="mt-5">
            Menüyü Aç
          </Button>
        </div>
        {/* qrcode paketinin ürettiği SVG sabit site URL'inden sunucuda üretilir, kullanıcı girdisi içermez. */}
        <div className="h-32 w-32 shrink-0 rounded-lg bg-white p-3" dangerouslySetInnerHTML={{ __html: svg }} />
      </Container>
    </div>
  )
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 7: Commit**

```bash
git add src/lib/qr.ts src/lib/qr.test.ts src/components/sections/QrBand.tsx
git commit -m "feat: QR uretim yardimcisi ve QrBand bolumu"
```

---

### Task 30: `src/app/page.tsx` — anasayfa bölümlerini dizme

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Task 18-29'daki tüm section bileşenleri.

- [ ] **Step 1: `src/app/page.tsx`'i tüm bölümlerle güncelle**

```tsx
import Hero from '@/components/sections/Hero'
import Welcome from '@/components/sections/Welcome'
import SplitPromo from '@/components/sections/SplitPromo'
import Featured from '@/components/sections/Featured'
import MosaicBanners from '@/components/sections/MosaicBanners'
import CenteredIntro from '@/components/sections/CenteredIntro'
import ParallaxSection from '@/components/sections/ParallaxSection'
import TrioStrip from '@/components/sections/TrioStrip'
import AltBlock from '@/components/sections/AltBlock'
import Reviews from '@/components/sections/Reviews'
import Gallery from '@/components/sections/Gallery'
import LocationHours from '@/components/sections/LocationHours'
import QrBand from '@/components/sections/QrBand'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Welcome />
      <SplitPromo />
      <Featured />
      <MosaicBanners />
      <CenteredIntro />
      <ParallaxSection />
      <TrioStrip />
      <AltBlock
        kicker="EGEM-TRAK Restaurant"
        title="Sıcak, doyurucu, güvenilir"
        text="Her gün değişen tabldot menümüzle, ev yemeği tadında doyurucu bir öğle molası sunuyoruz. Sanayi bölgesinin temposuna uygun, hızlı servisle."
        primaryCta={{ label: 'Menü', href: '/menu?tab=restaurant' }}
        secondaryCta={{ label: 'İletişim', href: '/iletisim' }}
        imageSlotTop="home.blockA.1"
        imageSlotBottom="home.blockA.2"
      />
      <AltBlock
        reverse
        kicker="EGEM Büfe"
        title="Hemen al, geç"
        text="Tost, sandviç, sosisli ve hamburger — sanayi bölgesinin temposuna uygun, hızlı ve pratik lezzetler dakikalar içinde hazır."
        primaryCta={{ label: 'Menü', href: '/menu?tab=bufe' }}
        secondaryCta={{ label: 'İletişim', href: '/iletisim' }}
        imageSlotTop="home.blockB.1"
        imageSlotBottom="home.blockB.2"
      />
      <Reviews />
      <Gallery />
      <LocationHours />
      <QrBand />
    </>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: anasayfa bolumlerini page.tsx'te diz"
```

---

### Task 31: Faz 2 doğrulaması

**Files:** (yok — yalnızca doğrulama)

- [ ] **Step 1: Otomatik doğrulama**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: Hepsi hatasız/PASS.

- [ ] **Step 2: Manuel doğrulama (dev server)**

Run: `npm run dev`

`http://localhost:3000` üzerinde doğrula:
- 14 bölüm sırasıyla görünüyor, art arda iki koyu section yok (ParallaxSection ve QrBand arasında Reviews/Gallery/LocationHours beyaz/brand-50/beyaz araya giriyor).
- Hero'da ok tuşları, dokunmatik kaydırma, nokta göstergeleri ve açık/kapalı rozeti çalışıyor.
- Featured kartlarında fiyat/sepet YOK, hover'da yalnızca hafif büyüme var.
- Sarı (accent-500) yalnızca kicker'larda, rozetlerde ve yıldızlarda — baskın değil.
- 360px genişlikte yatay kaydırma yok, TrioStrip mobilde yatay scroll-snap ile kayıyor.
- Gallery'de görsele tıklayınca lightbox açılıyor, ESC ve ok tuşlarıyla kontrol edilebiliyor.

- [ ] **Step 3: Commit (yalnızca doğrulama sırasında düzeltme yapıldıysa)**

```bash
git add -A
git commit -m "fix: faz 2 manuel dogrulama duzeltmeleri"
```

---

## Faz 3 — Alt Sayfalar

### Task 32: `ui/Accordion` (hafif TDD)

**Files:**
- Create: `src/components/ui/Accordion.tsx`, `src/components/ui/Accordion.test.tsx`

**Interfaces:**
- Produces: `<Accordion items: {question: string; answer: string}[] defaultOpenIndex?: number | null />`. Task 37 (/iletisim SSS) kullanır.

- [ ] **Step 1: `src/components/ui/Accordion.test.tsx` — başarısız testleri yaz**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Accordion from './Accordion'

const items = [
  { question: 'Soru 1', answer: 'Cevap 1' },
  { question: 'Soru 2', answer: 'Cevap 2' },
]

describe('Accordion', () => {
  it('defaultOpenIndex belirtilen maddeyi açık gösterir', () => {
    render(<Accordion items={items} defaultOpenIndex={0} />)
    expect(screen.getByText('Cevap 1')).toBeInTheDocument()
    expect(screen.queryByText('Cevap 2')).not.toBeInTheDocument()
  })

  it('başlığa tıklanınca ilgili madde açılır/kapanır', () => {
    render(<Accordion items={items} defaultOpenIndex={0} />)
    fireEvent.click(screen.getByText('Soru 2'))
    expect(screen.getByText('Cevap 2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Soru 1'))
    expect(screen.queryByText('Cevap 1')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/ui/Accordion.test.tsx`
Expected: FAIL — `Cannot find module './Accordion'`

- [ ] **Step 3: `src/components/ui/Accordion.tsx` implementasyonu**

```tsx
'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccordionItem = { question: string; answer: string }

export default function Accordion({ items, defaultOpenIndex = 0 }: { items: AccordionItem[]; defaultOpenIndex?: number | null }) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex)

  return (
    <div className="flex flex-col divide-y divide-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={cn(
                'flex min-h-[44px] w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-semibold',
                isOpen ? 'text-brand-500' : 'text-ink'
              )}
            >
              {item.question}
              <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            {isOpen && <p className="pb-4 text-sm leading-[1.6] text-ink-soft">{item.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/ui/Accordion.test.tsx`
Expected: PASS (2/2)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Accordion.tsx src/components/ui/Accordion.test.tsx
git commit -m "feat: Accordion bileseni"
```

---

### Task 33: Alt sayfa yardımcı section'ları — `PageHero`, `TodaysSpecialBlock`, `MenuPreview`, `BulkOrderBox`

**Files:**
- Create: `src/components/sections/PageHero.tsx`, `src/components/sections/TodaysSpecialBlock.tsx`, `src/components/sections/MenuPreview.tsx`, `src/components/sections/BulkOrderBox.tsx`

**Interfaces:**
- Consumes: `SmartImage` (Task 9), `Container`/`Section`/`SectionTitle`/`Button`/`Badge` (Task 8), `todaysSpecial`/`restaurantMenu` (Task 5), `siteConfig` (Task 3), `formatPrice`/`formatTurkishDate` (Task 2).
- Produces: `<PageHero imageSlot title breadcrumbLabel />`, `<TodaysSpecialBlock />`, `<MenuPreview />`, `<BulkOrderBox />`. Task 34 (restaurant) ve Task 35/36 (bufe/hakkimizda, yalnızca PageHero) kullanır. `TodaysSpecialBlock` Faz 4'te `/menu` sayfasında da yeniden kullanılır.

- [ ] **Step 1: `src/components/sections/PageHero.tsx`**

```tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import SmartImage from '@/components/ui/SmartImage'
import Container from '@/components/ui/Container'

type PageHeroProps = {
  imageSlot: string
  title: string
  breadcrumbLabel: string
}

export default function PageHero({ imageSlot, title, breadcrumbLabel }: PageHeroProps) {
  return (
    <div className="relative flex h-[420px] w-full items-end overflow-hidden">
      <SmartImage slot={imageSlot} className="absolute inset-0 h-full" dark sizes="100vw" />
      <div className="absolute inset-0 bg-brand-950/55" />
      <Container className="relative z-10 pb-10 text-white">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-sm text-white/70">
          <Link href="/" className="hover:text-white">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-white">{breadcrumbLabel}</span>
        </nav>
        <h1 className="font-display text-3xl font-extrabold lg:text-5xl">{title}</h1>
      </Container>
    </div>
  )
}
```

- [ ] **Step 2: `src/components/sections/TodaysSpecialBlock.tsx`**

```tsx
import Container from '@/components/ui/Container'
import { todaysSpecial } from '@/data/menu'
import { formatTurkishDate } from '@/lib/utils'

export default function TodaysSpecialBlock() {
  return (
    <Container className="py-10">
      <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-6">
        <span className="rounded-full bg-accent-500 px-3 py-1 text-[11px] font-semibold text-ink">Bugünün Tabldotu</span>
        <p className="mt-3 text-sm font-medium text-ink-soft">{formatTurkishDate(new Date())}</p>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          {todaysSpecial.items.map((name) => (
            <li key={name} className="text-[17px] font-semibold text-ink">
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-soft">{todaysSpecial.note}</p>
      </div>
    </Container>
  )
}
```

- [ ] **Step 3: `src/components/sections/MenuPreview.tsx`**

```tsx
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { restaurantMenu } from '@/data/menu'
import { siteConfig } from '@/config/site'
import { formatPrice } from '@/lib/utils'

export default function MenuPreview() {
  const previewCategories = restaurantMenu.slice(0, 4)

  return (
    <Section tone="brand-50">
      <Container className="flex flex-col gap-10">
        <SectionTitle kicker="Menümüz" lead="Neler" strong="Sunuyoruz?" />
        <div className="grid gap-8 lg:grid-cols-2">
          {previewCategories.map((category) => (
            <div key={category.key}>
              <h3 className="mb-3 font-display text-lg font-bold text-ink">{category.title}</h3>
              <ul className="flex flex-col divide-y divide-line">
                {category.items.slice(0, 4).map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] text-ink">{item.name}</span>
                      {item.tags?.map((tag) => (
                        <Badge key={tag} tag={tag} />
                      ))}
                    </div>
                    {siteConfig.showPrices && item.price && (
                      <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">{formatPrice(item.price)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button href="/menu?tab=restaurant">Tüm Menü</Button>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: `src/components/sections/BulkOrderBox.tsx`**

```tsx
import { MessageCircle } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/config/site'

export default function BulkOrderBox() {
  return (
    <Container className="py-4">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-brand-900 p-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
        <div>
          <h3 className="font-display text-xl font-extrabold">Toplu Yemek &amp; Kumanya</h3>
          <p className="mt-1 max-w-md text-white/80">
            Sanayi bölgesindeki işletmelere günlük öğle yemeği ve toplu paket servis hizmeti sunuyoruz.
          </p>
        </div>
        <Button href={siteConfig.social.whatsapp} variant="outline-light">
          <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          WhatsApp&apos;tan Yazın
        </Button>
      </div>
    </Container>
  )
}
```

- [ ] **Step 5: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/PageHero.tsx src/components/sections/TodaysSpecialBlock.tsx src/components/sections/MenuPreview.tsx src/components/sections/BulkOrderBox.tsx
git commit -m "feat: alt sayfa yardimci bolumleri (PageHero, TodaysSpecialBlock, MenuPreview, BulkOrderBox)"
```

---

### Task 34: `app/restaurant/page.tsx`

**Files:**
- Create: `src/app/restaurant/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `TodaysSpecialBlock`, `MenuPreview`, `BulkOrderBox` (Task 33), `AltBlock` (Task 25), `MosaicBanners` (Task 22), `LocationHours` (Task 28), `SmartImage` (Task 9), `siteConfig` (Task 3).

- [ ] **Step 1: `src/app/restaurant/page.tsx`**

```tsx
import type { Metadata } from 'next'
import PageHero from '@/components/sections/PageHero'
import AltBlock from '@/components/sections/AltBlock'
import TodaysSpecialBlock from '@/components/sections/TodaysSpecialBlock'
import MenuPreview from '@/components/sections/MenuPreview'
import BulkOrderBox from '@/components/sections/BulkOrderBox'
import MosaicBanners from '@/components/sections/MosaicBanners'
import LocationHours from '@/components/sections/LocationHours'
import Section from '@/components/ui/Section'
import Container from '@/components/ui/Container'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: siteConfig.restaurant.name,
  description: "Çorlu Yeni Sanayi Bölgesi'nde her gün taze pişen ev yemekleri. Günlük tabldot menüsünü hemen görün.",
  alternates: { canonical: '/restaurant' },
}

export default function RestaurantPage() {
  return (
    <div>
      <PageHero imageSlot="restaurant.hero" title="EGEM-TRAK Restaurant" breadcrumbLabel="Restaurant" />
      <AltBlock
        kicker="Tanıyalım"
        title="Ev yemeği tadında, her gün taze"
        text="EGEM-TRAK Restaurant, Çorlu Yeni Sanayi Bölgesi'nde çalışanlara ve bölgeyi kullanan herkese sıcak, doyurucu ve güvenilir bir öğün sunar. Menümüz her gün değişir, malzemeler taze hazırlanır."
        primaryCta={{ label: 'Menü', href: '/menu?tab=restaurant' }}
        secondaryCta={{ label: 'İletişim', href: '/iletisim' }}
        imageSlotTop="restaurant.intro.1"
        imageSlotBottom="restaurant.intro.2"
      />
      <TodaysSpecialBlock />
      <MenuPreview />
      <BulkOrderBox />
      <MosaicBanners />
      <Section tone="white">
        <Container className="flex flex-col items-center gap-10">
          <SectionTitle kicker="Galeri" lead="Lokantamızdan" strong="Kareler" />
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            <SmartImage slot="restaurant.gallery.1" className="rounded-lg" />
            <SmartImage slot="restaurant.gallery.2" className="rounded-lg" />
            <SmartImage slot="restaurant.gallery.3" className="rounded-lg" />
            <SmartImage slot="restaurant.gallery.4" className="rounded-lg" />
          </div>
        </Container>
      </Section>
      <LocationHours />
    </div>
  )
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/app/restaurant/page.tsx
git commit -m "feat: /restaurant sayfasi"
```

---

### Task 35: `app/bufe/page.tsx` — `ThreeStepStrip`, `CategoryGrid`, `PopularStrip`, `WhatsAppBox`

**Files:**
- Create: `src/components/sections/ThreeStepStrip.tsx`, `src/components/sections/CategoryGrid.tsx`, `src/components/sections/PopularStrip.tsx`, `src/components/sections/WhatsAppBox.tsx`, `src/app/bufe/page.tsx`

**Interfaces:**
- Consumes: `bufeMenu` (Task 6), `PageHero` (Task 33), `LocationHours` (Task 28), `siteConfig` (Task 3).

- [ ] **Step 1: `src/components/sections/ThreeStepStrip.tsx`**

```tsx
import { ClipboardList, ChefHat, ShoppingBag } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'

const steps = [
  { icon: ClipboardList, title: 'Seç', text: 'Tost, sandviç veya sosisliden dilediğini seç.' },
  { icon: ChefHat, title: 'Hazırlansın', text: 'Siparişin dakikalar içinde hazırlanır.' },
  { icon: ShoppingBag, title: 'Al Git', text: 'Sıcacık ürününü alıp yoluna devam et.' },
] as const

export default function ThreeStepStrip() {
  return (
    <Section tone="brand-50">
      <Container className="grid gap-8 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
              <step.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="font-display text-lg font-bold text-ink">{step.title}</p>
            <p className="text-sm text-ink-soft">{step.text}</p>
          </div>
        ))}
      </Container>
    </Section>
  )
}
```

- [ ] **Step 2: `src/components/sections/CategoryGrid.tsx`**

```tsx
import Link from 'next/link'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import SmartImage from '@/components/ui/SmartImage'
import { bufeMenu } from '@/data/bufe'

const categorySlots = ['bufe.category.1', 'bufe.category.2', 'bufe.category.3', 'bufe.category.4', 'bufe.category.5', 'bufe.category.6'] as const

export default function CategoryGrid() {
  return (
    <Section tone="white">
      <Container className="flex flex-col items-center gap-10">
        <SectionTitle kicker="Büfe Menüsü" lead="Kategorilere" strong="Göz Atın" />
        <div className="grid w-full grid-cols-2 gap-5 lg:grid-cols-3">
          {bufeMenu.map((category, i) => (
            <Link key={category.key} href={`/menu?tab=bufe#${category.key}`} className="group flex flex-col overflow-hidden rounded-xl shadow-sm">
              <SmartImage slot={categorySlots[i]} className="transition-transform duration-200 group-hover:scale-[1.03]" />
              <div className="bg-white p-4 text-center">
                <p className="text-[15px] font-semibold text-ink">{category.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: `src/components/sections/PopularStrip.tsx`**

```tsx
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'
import { bufeMenu } from '@/data/bufe'

const popularNames = ['Ayvalık Tostu', 'Karışık Tost', 'Kaşarlı Hamburger', 'Tavuklu Sandviç', 'Patates Kızartması']

export default function PopularStrip() {
  const allItems = bufeMenu.flatMap((c) => c.items)
  const popularItems = popularNames.map((name) => allItems.find((item) => item.name === name)).filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <Section tone="brand-50">
      <Container className="flex flex-col gap-8">
        <SectionTitle kicker="En Çok Tercih Edilenler" lead="Popüler" strong="Ürünler" align="left" />
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {popularItems.map((item) => (
            <div key={item.name} className="min-w-[180px] shrink-0 rounded-xl bg-white p-5 shadow-sm" style={{ scrollSnapAlign: 'start' }}>
              <p className="text-[15px] font-semibold text-ink">{item.name}</p>
              {item.desc && <p className="mt-1 text-sm text-ink-soft">{item.desc}</p>}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: `src/components/sections/WhatsAppBox.tsx`**

```tsx
import { MessageCircle } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/config/site'

export default function WhatsAppBox() {
  return (
    <Container className="py-4">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-brand-900 p-10 text-center text-white">
        <MessageCircle className="h-8 w-8 text-accent-500" aria-hidden="true" />
        <h3 className="font-display text-xl font-extrabold">WhatsApp&apos;tan yazın, hazır olsun</h3>
        <p className="max-w-sm text-white/80">Siparişinizi WhatsApp&apos;tan iletin, vardığınızda hazır bulun.</p>
        <Button href={siteConfig.social.whatsapp} className="mt-2">
          WhatsApp&apos;tan Yaz
        </Button>
      </div>
    </Container>
  )
}
```

- [ ] **Step 5: `src/app/bufe/page.tsx`**

```tsx
import type { Metadata } from 'next'
import PageHero from '@/components/sections/PageHero'
import ThreeStepStrip from '@/components/sections/ThreeStepStrip'
import CategoryGrid from '@/components/sections/CategoryGrid'
import PopularStrip from '@/components/sections/PopularStrip'
import WhatsAppBox from '@/components/sections/WhatsAppBox'
import LocationHours from '@/components/sections/LocationHours'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: siteConfig.bufe.name,
  description: "Tost, sandviç, sosisli ve hamburger — Çorlu Yeni Sanayi Bölgesi'nde hızlı ve pratik lezzetler.",
  alternates: { canonical: '/bufe' },
}

export default function BufePage() {
  return (
    <div>
      <PageHero imageSlot="bufe.hero" title="EGEM Büfe" breadcrumbLabel="Büfe" />
      <ThreeStepStrip />
      <CategoryGrid />
      <PopularStrip />
      <WhatsAppBox />
      <LocationHours />
    </div>
  )
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/ThreeStepStrip.tsx src/components/sections/CategoryGrid.tsx src/components/sections/PopularStrip.tsx src/components/sections/WhatsAppBox.tsx src/app/bufe/page.tsx
git commit -m "feat: /bufe sayfasi"
```

---

### Task 36: `app/hakkimizda/page.tsx`

**Files:**
- Create: `src/app/hakkimizda/page.tsx`

**Interfaces:**
- Consumes: `features` (Task 7), `PageHero` (Task 33), `SmartImage` (Task 9), `Container`/`Section`/`SectionTitle`/`Button` (Task 8).

- [ ] **Step 1: Doğrula — `about.wideBand` slotu Task 4'te zaten eklendi**

`src/config/images.ts` içinde `about.wide` (4/3, "Lokantamız Hakkında" bloğu) ve `about.wideBand` (16/9, değerlerin altındaki tam genişlik bant) slotlarının ayrı ayrı tanımlı olduğunu doğrula (bkz. Task 4).

- [ ] **Step 2: `src/app/hakkimizda/page.tsx`**

```tsx
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
            <h1 className="mt-3 font-display text-[26px] font-extrabold leading-[1.2] text-ink lg:text-[44px]">
              Sanayi bölgesinin güvenilir sofrası
            </h1>
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
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 4: Commit**

```bash
git add src/app/hakkimizda/page.tsx
git commit -m "feat: /hakkimizda sayfasi"
```

---

### Task 37: `app/iletisim/page.tsx` — SSS akordiyonu + iletişim formu (hafif TDD)

**Files:**
- Create: `src/components/sections/ContactForm.tsx`, `src/components/sections/ContactForm.test.tsx`, `src/app/iletisim/page.tsx`

**Interfaces:**
- Consumes: `faqs` (Task 7), `Accordion` (Task 32), `Button`/`SectionTitle` (Task 8), `SmartImage` (Task 9, `contact.hero` slotu), `LocationHours` (Task 28).
- Produces: `<ContactForm />` — client-side validasyon, submit handler `// TODO: form gönderim entegrasyonu` yorumuyla, başarı/hata UI durumları hazır.

- [ ] **Step 1: `src/components/sections/ContactForm.test.tsx` — başarısız testleri yaz**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'

describe('ContactForm', () => {
  it('boş form gönderilince hata mesajları gösterir', () => {
    render(<ContactForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
    expect(screen.getByText('Ad soyad zorunludur.')).toBeInTheDocument()
  })

  it('geçerli veriyle gönderilince başarı mesajı gösterir', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText('İsim'), 'Ayşe Yılmaz')
    await user.type(screen.getByLabelText('E-posta'), 'ayse@example.com')
    await user.type(screen.getByLabelText('Telefon'), '05551234567')
    await user.type(screen.getByLabelText('Konu'), 'Bilgi Talebi')
    await user.type(screen.getByLabelText('Mesaj'), 'Merhaba, toplu sipariş hakkında bilgi almak istiyorum.')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))
    expect(await screen.findByText('Mesajınız alındı, en kısa sürede dönüş yapacağız.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/sections/ContactForm.test.tsx`
Expected: FAIL — `Cannot find module './ContactForm'`

- [ ] **Step 3: `src/components/sections/ContactForm.tsx` implementasyonu**

```tsx
'use client'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import Button from '@/components/ui/Button'

type FormState = { name: string; email: string; phone: string; subject: string; message: string }
type FormErrors = Partial<Record<keyof FormState, string>>

const initialState: FormState = { name: '', email: '', phone: '', subject: '', message: '' }

function validate(values: FormState): FormErrors {
  const next: FormErrors = {}
  if (!values.name.trim()) next.name = 'Ad soyad zorunludur.'
  if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Geçerli bir e-posta girin.'
  if (!values.phone.trim()) next.phone = 'Telefon numarası zorunludur.'
  if (!values.subject.trim()) next.subject = 'Konu zorunludur.'
  if (values.message.trim().length < 10) next.message = 'Mesajınız en az 10 karakter olmalı.'
  return next
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  function handleChange(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setStatus('idle')
      return
    }
    try {
      // TODO: form gönderim entegrasyonu (e-posta servisi / API rotası)
      setStatus('success')
      setForm(initialState)
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            İsim
          </label>
          <input id="name" value={form.name} onChange={handleChange('name')} className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
            Telefon
          </label>
          <input id="phone" value={form.phone} onChange={handleChange('phone')} className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]" />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="subject" className="mb-1 block text-sm font-medium text-ink">
            Konu
          </label>
          <input id="subject" value={form.subject} onChange={handleChange('subject')} className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]" />
          {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          Mesaj
        </label>
        <textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={handleChange('message')}
          className="w-full rounded-btn border border-line px-3 py-2 text-[15px]"
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
      <Button type="submit">Gönder</Button>
      {status === 'success' && (
        <p role="status" className="text-sm font-medium text-green-700">
          Mesajınız alındı, en kısa sürede dönüş yapacağız.
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-sm font-medium text-red-600">
          Bir şeyler ters gitti, lütfen tekrar deneyin.
        </p>
      )}
    </form>
  )
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/sections/ContactForm.test.tsx`
Expected: PASS (2/2)

- [ ] **Step 5: `src/app/iletisim/page.tsx`**

```tsx
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
        <SmartImage slot="contact.hero" className="absolute inset-0 h-full" dark sizes="100vw" />
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
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/ContactForm.tsx src/components/sections/ContactForm.test.tsx src/app/iletisim/page.tsx
git commit -m "feat: /iletisim sayfasi (SSS akordiyonu + iletisim formu)"
```

---

### Task 38: Faz 3 doğrulaması

**Files:** (yok — yalnızca doğrulama)

- [ ] **Step 1: Otomatik doğrulama**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: Hepsi hatasız/PASS.

- [ ] **Step 2: Manuel doğrulama (dev server)**

Run: `npm run dev`

`/restaurant`, `/bufe`, `/hakkimizda`, `/iletisim` sayfalarını tarayıcıda aç ve doğrula:
- Her sayfada header baştan koyu (şeffaf mod yok).
- `/restaurant`'ta "Bugünün Tabldotu" sarı rozetli ve güncel tarihi gösteriyor.
- `/bufe`'de kategori kartları `/menu?tab=bufe#<kategori>` linklerine gidiyor.
- `/iletisim`'de SSS'nin ilk maddesi açık geliyor, form boş gönderilince hata mesajları görünüyor, geçerli veriyle başarı mesajı görünüyor.
- 360px genişlikte hiçbir sayfada yatay kaydırma yok.

- [ ] **Step 3: Commit (yalnızca doğrulama sırasında düzeltme yapıldıysa)**

```bash
git add -A
git commit -m "fix: faz 3 manuel dogrulama duzeltmeleri"
```

---

## Faz 4 — `/menu` QR Menü Sistemi

### Task 39: `Header`'ı `/menu` için sadeleştir (hafif TDD)

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Header.menu.test.tsx`

**Interfaces:**
- `Header` artık `pathname === '/menu'` iken tam nav yerine yalnızca logo + Ara (telefon) + WhatsApp ikonları gösterir.

- [ ] **Step 1: `src/components/layout/Header.menu.test.tsx` — başarısız test yaz**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/menu' }))

describe('Header (/menu)', () => {
  it('sadeleştirilmiş header gösterir: tam nav yok, Ara ve WhatsApp ikonları var', () => {
    render(<Header />)
    expect(screen.getByLabelText('Ara')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
    expect(screen.queryByText('RESTAURANT')).not.toBeInTheDocument()
    expect(screen.queryByText('HAKKIMIZDA')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/layout/Header.menu.test.tsx`
Expected: FAIL — `Ara` etiketi bulunamıyor (sadeleştirilmiş dal henüz yok).

- [ ] **Step 3: `src/components/layout/Header.tsx`'i güncelle — `/menu` dalını ekle**

`Header.tsx`'in en üstündeki import satırına `MessageCircle` ekle:

```tsx
import { Search, Phone, MessageCircle, Menu as MenuIcon } from 'lucide-react'
```

`export default function Header() {` içinde, `const [drawerOpen, setDrawerOpen] = useState(false)` satırının hemen altına `isMenuPage` değişkenini ekle:

```tsx
const isMenuPage = pathname === '/menu'
```

`useEffect(...)` bloğunun hemen altına, `const dark = ...` satırından ÖNCE aşağıdaki erken dönüşü ekle:

```tsx
if (isMenuPage) {
  return (
    <header role="banner" className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-brand-950 px-5">
      <Link href="/" aria-label={siteConfig.brandName}>
        <SmartImage slot="brand.logoLight" className="h-9 w-[140px]" dark sizes="140px" />
      </Link>
      <div className="flex items-center gap-4">
        <a href={`tel:${siteConfig.restaurant.phone}`} aria-label="Ara" className="text-white">
          <Phone className="h-5 w-5" aria-hidden="true" />
        </a>
        <a href={siteConfig.social.whatsapp} aria-label="WhatsApp" className="text-white">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Testleri çalıştır, geçtiklerini doğrula (üç Header test dosyası da)**

Run: `npx vitest run src/components/layout/Header.test.tsx src/components/layout/Header.nonhome.test.tsx src/components/layout/Header.menu.test.tsx`
Expected: PASS (4/4 toplam)

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Header.menu.test.tsx
git commit -m "feat: /menu icin sadelestirilmis header dali"
```

---

### Task 40: `lib/useDebouncedValue` ve `lib/menuSearch` (tam TDD)

**Files:**
- Create: `src/lib/useDebouncedValue.ts`, `src/lib/useDebouncedValue.test.ts`
- Create: `src/lib/menuSearch.ts`, `src/lib/menuSearch.test.ts`

**Interfaces:**
- Produces: `useDebouncedValue<T>(value: T, delay?: number): T`.
- Consumes: `MenuCategory`, `MenuItem` tipleri (Task 5).
- Produces: `filterMenuCategories(categories: MenuCategory[], query: string): MenuCategory[]`.

- [ ] **Step 1: `src/lib/useDebouncedValue.test.ts` — başarısız test yaz**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('değeri belirtilen gecikmeden sonra günceller', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } })
    expect(result.current).toBe('a')
    rerender({ value: 'ab' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('ab')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/useDebouncedValue.test.ts`
Expected: FAIL — `Cannot find module './useDebouncedValue'`

- [ ] **Step 3: `src/lib/useDebouncedValue.ts` implementasyonu**

```ts
'use client'
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/useDebouncedValue.test.ts`
Expected: PASS (1/1)

- [ ] **Step 5: `src/lib/menuSearch.test.ts` — başarısız testleri yaz**

```ts
import { describe, it, expect } from 'vitest'
import { filterMenuCategories } from './menuSearch'
import type { MenuCategory } from '@/data/menu'

const categories: MenuCategory[] = [
  { key: 'corbalar', title: 'Çorbalar', items: [{ name: 'Mercimek Çorbası', desc: 'Klasik' }, { name: 'Ezogelin Çorbası' }] },
  { key: 'tatlilar', title: 'Tatlılar', items: [{ name: 'Sütlaç' }] },
]

describe('filterMenuCategories', () => {
  it('boş sorguda tüm kategorileri değiştirmeden döner', () => {
    expect(filterMenuCategories(categories, '')).toEqual(categories)
  })

  it('isimde eşleşen ürünleri bulur, eşleşmeyen kategoriyi eler', () => {
    const result = filterMenuCategories(categories, 'mercimek')
    expect(result).toHaveLength(1)
    expect(result[0].items).toHaveLength(1)
    expect(result[0].items[0].name).toBe('Mercimek Çorbası')
  })

  it('açıklamada eşleşen ürünleri de bulur', () => {
    const result = filterMenuCategories(categories, 'klasik')
    expect(result[0].items[0].name).toBe('Mercimek Çorbası')
  })

  it('büyük/küçük harf duyarsızdır', () => {
    const result = filterMenuCategories(categories, 'SÜTLAÇ')
    expect(result[0].items[0].name).toBe('Sütlaç')
  })
})
```

- [ ] **Step 6: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/menuSearch.test.ts`
Expected: FAIL — `Cannot find module './menuSearch'`

- [ ] **Step 7: `src/lib/menuSearch.ts` implementasyonu**

```ts
import type { MenuCategory, MenuItem } from '@/data/menu'

export function filterMenuCategories(categories: MenuCategory[], query: string): MenuCategory[] {
  const normalized = query.trim().toLocaleLowerCase('tr-TR')
  if (!normalized) return categories

  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => matchesQuery(item, normalized)),
    }))
    .filter((category) => category.items.length > 0)
}

function matchesQuery(item: MenuItem, normalized: string): boolean {
  const haystack = `${item.name} ${item.desc ?? ''}`.toLocaleLowerCase('tr-TR')
  return haystack.includes(normalized)
}
```

- [ ] **Step 8: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/menuSearch.test.ts`
Expected: PASS (4/4)

- [ ] **Step 9: Commit**

```bash
git add src/lib/useDebouncedValue.ts src/lib/useDebouncedValue.test.ts src/lib/menuSearch.ts src/lib/menuSearch.test.ts
git commit -m "feat: useDebouncedValue hook'u ve menu arama/filtreleme mantigi"
```

---

### Task 41: `lib/useActiveSection` (hafif TDD)

**Files:**
- Create: `src/lib/useActiveSection.ts`, `src/lib/useActiveSection.test.ts`

**Interfaces:**
- Produces: `useActiveSection(ids: string[]): string | null`. Task 42 (CategoryBar) kullanır.

- [ ] **Step 1: `src/lib/useActiveSection.test.ts` — başarısız test yaz**

```ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useActiveSection } from './useActiveSection'

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    TestIntersectionObserver.instances.push(this)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = () => []
}

describe('useActiveSection', () => {
  it("görünür hale gelen section id'sini aktif olarak işaretler", () => {
    // @ts-expect-error test mock
    global.IntersectionObserver = TestIntersectionObserver
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'

    const { result } = renderHook(() => useActiveSection(['a', 'b']))
    expect(result.current).toBe('a')

    const observerInstance = TestIntersectionObserver.instances.at(-1)!
    act(() => {
      observerInstance.callback(
        [{ isIntersecting: true, target: document.getElementById('b') } as unknown as IntersectionObserverEntry],
        observerInstance as unknown as IntersectionObserver
      )
    })
    expect(result.current).toBe('b')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/useActiveSection.test.ts`
Expected: FAIL — `Cannot find module './useActiveSection'`

- [ ] **Step 3: `src/lib/useActiveSection.ts` implementasyonu**

```ts
'use client'
import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    if (ids.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')])

  return activeId
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/useActiveSection.test.ts`
Expected: PASS (1/1)

- [ ] **Step 5: Commit**

```bash
git add src/lib/useActiveSection.ts src/lib/useActiveSection.test.ts
git commit -m "feat: useActiveSection hook'u (kategori barinda aktif chip takibi)"
```

---

### Task 42: `menu/MenuTabs`, `menu/CategoryBar`, `menu/MenuItemRow`, `menu/MenuSearch`, `menu/MenuContent`

**Files:**
- Create: `src/components/menu/MenuTabs.tsx`, `src/components/menu/CategoryBar.tsx`, `src/components/menu/MenuItemRow.tsx`, `src/components/menu/MenuSearch.tsx`, `src/components/menu/MenuContent.tsx`

**Interfaces:**
- Consumes: `useActiveSection` (Task 41), `useDebouncedValue`/`filterMenuCategories` (Task 40), `Badge` (Task 8), `siteConfig` (Task 3), `formatPrice` (Task 2), `MenuCategory`/`MenuItem` (Task 5).
- Produces: `<MenuTabs active: 'restaurant' | 'bufe' />`, `<CategoryBar categories: {key,title}[] />`, `<MenuItemRow item: MenuItem />`, `<MenuSearch onChange: (q: string) => void />`, `<MenuContent categories: MenuCategory[] />`. Task 43 (`/menu` sayfası) `MenuTabs` ve `MenuContent`'i kullanır.

- [ ] **Step 1: `src/components/menu/MenuTabs.tsx`**

```tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

type MenuTabsProps = {
  active: 'restaurant' | 'bufe'
}

const tabs = [
  { key: 'restaurant', label: 'RESTAURANT' },
  { key: 'bufe', label: 'BÜFE' },
] as const

export default function MenuTabs({ active }: MenuTabsProps) {
  return (
    <div role="tablist" aria-label="Menü seçimi" className="grid grid-cols-2 border-b border-line">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/menu?tab=${tab.key}`}
          role="tab"
          aria-selected={active === tab.key}
          className={cn(
            'flex min-h-[52px] items-center justify-center text-[15px] font-bold uppercase tracking-[0.04em]',
            active === tab.key ? 'border-b-2 border-brand-500 text-brand-500' : 'text-ink-soft'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: `src/components/menu/CategoryBar.tsx`**

```tsx
'use client'
import { cn } from '@/lib/utils'
import { useActiveSection } from '@/lib/useActiveSection'

type CategoryBarProps = {
  categories: { key: string; title: string }[]
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const activeId = useActiveSection(categories.map((c) => c.key))

  function scrollToCategory(key: string) {
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="sticky top-16 z-30 overflow-x-auto border-b border-line bg-white">
      <div className="flex gap-2 px-4 py-3">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => scrollToCategory(category.key)}
            className={cn(
              'flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-semibold',
              activeId === category.key ? 'border-accent-500 text-brand-500' : 'border-line text-ink-soft'
            )}
          >
            {category.title}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: `src/components/menu/MenuItemRow.tsx`**

```tsx
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import { siteConfig } from '@/config/site'
import { formatPrice } from '@/lib/utils'
import type { MenuItem } from '@/data/menu'

export default function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-3">
      {item.image && (
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg">
          <Image src={item.image} alt={item.name} width={72} height={72} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-ink">{item.name}</p>
            {item.tags?.map((tag) => (
              <Badge key={tag} tag={tag} />
            ))}
          </div>
          {item.desc && <p className="mt-0.5 text-sm text-ink-soft">{item.desc}</p>}
        </div>
        {siteConfig.showPrices && item.price && (
          <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">{formatPrice(item.price)}</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `src/components/menu/MenuSearch.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useDebouncedValue } from '@/lib/useDebouncedValue'

type MenuSearchProps = {
  onChange: (query: string) => void
}

export default function MenuSearch({ onChange }: MenuSearchProps) {
  const [value, setValue] = useState('')
  const debounced = useDebouncedValue(value, 250)

  useEffect(() => {
    onChange(debounced)
  }, [debounced, onChange])

  return (
    <div className="relative px-4 py-3">
      <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Menüde ara..."
        aria-label="Menüde ara"
        className="min-h-[44px] w-full rounded-btn border border-line pl-10 pr-3 text-[15px]"
      />
    </div>
  )
}
```

- [ ] **Step 5: `src/components/menu/MenuContent.tsx`**

```tsx
'use client'
import { useMemo, useState } from 'react'
import CategoryBar from './CategoryBar'
import MenuSearch from './MenuSearch'
import MenuItemRow from './MenuItemRow'
import { filterMenuCategories } from '@/lib/menuSearch'
import type { MenuCategory } from '@/data/menu'

export default function MenuContent({ categories }: { categories: MenuCategory[] }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => filterMenuCategories(categories, query), [categories, query])

  return (
    <div>
      <MenuSearch onChange={setQuery} />
      <CategoryBar categories={categories.map((c) => ({ key: c.key, title: c.title }))} />
      <div className="px-4">
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink-soft">Aramanızla eşleşen ürün bulunamadı.</p>}
        {filtered.map((category) => (
          <section key={category.key} id={category.key} className="scroll-mt-32 py-6">
            <h2 className="mb-2 font-display text-lg font-bold text-ink">{category.title}</h2>
            <div>
              {category.items.map((item) => (
                <MenuItemRow key={item.name} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 7: Commit**

```bash
git add src/components/menu/MenuTabs.tsx src/components/menu/CategoryBar.tsx src/components/menu/MenuItemRow.tsx src/components/menu/MenuSearch.tsx src/components/menu/MenuContent.tsx
git commit -m "feat: menu bilesenleri (MenuTabs, CategoryBar, MenuItemRow, MenuSearch, MenuContent)"
```

---

### Task 43: `app/menu/page.tsx`

**Files:**
- Create: `src/app/menu/page.tsx`

**Interfaces:**
- Consumes: `MenuTabs`, `MenuContent` (Task 42), `TodaysSpecialBlock` (Task 33), `restaurantMenu` (Task 5), `bufeMenu` (Task 6), `siteConfig` (Task 3).

- [ ] **Step 1: `src/app/menu/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Phone, MessageCircle, Navigation } from 'lucide-react'
import MenuTabs from '@/components/menu/MenuTabs'
import MenuContent from '@/components/menu/MenuContent'
import TodaysSpecialBlock from '@/components/sections/TodaysSpecialBlock'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { restaurantMenu } from '@/data/menu'
import { bufeMenu } from '@/data/bufe'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Menü',
  description: 'EGEM-TRAK Restaurant ve EGEM Büfe güncel menüsü — QR kodunuzu okutun, saniyeler içinde görün.',
  alternates: { canonical: '/menu' },
}

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams
  const activeTab: 'restaurant' | 'bufe' = params.tab === 'bufe' ? 'bufe' : 'restaurant'
  const categories = activeTab === 'bufe' ? bufeMenu : restaurantMenu

  return (
    <div className="pb-10 pt-16">
      <MenuTabs active={activeTab} />
      {activeTab === 'restaurant' && <TodaysSpecialBlock />}
      <MenuContent categories={categories} />
      <Container className="flex flex-col gap-4 border-t border-line py-10 text-sm text-ink-soft">
        <p>Alerjen bilgisi için lütfen personelimize danışın.</p>
        <p>
          Restaurant: {siteConfig.restaurant.phoneDisplay} · Büfe: {siteConfig.bufe.phoneDisplay}
        </p>
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
  )
}
```

Not: `searchParams` Next.js'te (bu plan yazıldığı tarihte güncel olan sürümde) asenkron bir `Promise` olarak gelir; bu yüzden sayfa `async` tanımlanır ve `await searchParams` ile okunur.

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/app/menu/page.tsx
git commit -m "feat: /menu QR menu sayfasi"
```

---

### Task 44: Faz 4 doğrulaması

**Files:** (yok — yalnızca doğrulama)

- [ ] **Step 1: Otomatik doğrulama**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: Hepsi hatasız/PASS.

- [ ] **Step 2: Manuel doğrulama (dev server, mobil genişlikte)**

Run: `npm run dev`

`/menu`, `/menu?tab=restaurant`, `/menu?tab=bufe` sayfalarını mobil genişlikte (DevTools 375px) aç ve doğrula:
- Header'da tam nav YOK, yalnızca logo + Ara + WhatsApp ikonları var.
- Sekme seçimi URL'e yansıyor, doğru kategoriler görünüyor.
- Kategori barı sticky, kategoriye tıklayınca yumuşak scroll oluyor, scroll ederken aktif chip güncelleniyor.
- Restaurant sekmesinde "Bugünün Tabldotu" en üstte, sarı rozetli.
- Arama kutusuna yazınca (debounce sonrası) eşleşmeyen ürünler/kategoriler kayboluyor.
- Fiyatlar `showPrices: true` olduğu için görünüyor; `siteConfig.showPrices`'ı geçici olarak `false` yapıp fiyatların kaybolduğunu doğrula, sonra `true`'ya geri al.
- Dokunma hedefleri (chip, sekme, satır) rahat tıklanabilir büyüklükte.

- [ ] **Step 3: Commit (yalnızca doğrulama sırasında düzeltme yapıldıysa)**

```bash
git add -A
git commit -m "fix: faz 4 manuel dogrulama duzeltmeleri"
```

---

## Faz 5 — `/qr`, SEO, IMAGES.md, README, Son Cila

### Task 45: `lib/jsonld` (tam TDD) ve root layout'a kablolama

**Files:**
- Create: `src/lib/jsonld.ts`, `src/lib/jsonld.test.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `siteConfig`, `BusinessHours`, `Weekday` (Task 2, Task 3).
- Produces: `getRestaurantJsonLd(): object`, `getBufeJsonLd(): object`.

- [ ] **Step 1: `src/lib/jsonld.test.ts` — başarısız testleri yaz**

```ts
import { describe, it, expect } from 'vitest'
import { getRestaurantJsonLd, getBufeJsonLd } from './jsonld'

describe('getRestaurantJsonLd', () => {
  it('Restaurant tipinde ve gerekli alanları içerir', () => {
    const data = getRestaurantJsonLd()
    expect(data['@type']).toBe('Restaurant')
    expect(data.hasMenu).toContain('/menu?tab=restaurant')
    expect(data.openingHoursSpecification.length).toBeGreaterThan(0)
    expect(data.servesCuisine).toBe('Türk Mutfağı')
  })
})

describe('getBufeJsonLd', () => {
  it('FastFoodRestaurant tipinde ve gerekli alanları içerir', () => {
    const data = getBufeJsonLd()
    expect(data['@type']).toBe('FastFoodRestaurant')
    expect(data.hasMenu).toContain('/menu?tab=bufe')
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/jsonld.test.ts`
Expected: FAIL — `Cannot find module './jsonld'`

- [ ] **Step 3: `src/lib/jsonld.ts` implementasyonu**

```ts
import { siteConfig } from '@/config/site'
import type { BusinessHours, Weekday } from '@/lib/hours'

const dayMap: Record<Weekday, string> = {
  pazartesi: 'Monday',
  sali: 'Tuesday',
  carsamba: 'Wednesday',
  persembe: 'Thursday',
  cuma: 'Friday',
  cumartesi: 'Saturday',
  pazar: 'Sunday',
}

function toOpeningHours(hours: BusinessHours) {
  return (Object.keys(hours) as Weekday[])
    .filter((day) => hours[day] !== null)
    .map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayMap[day],
      opens: hours[day]!.open,
      closes: hours[day]!.close,
    }))
}

export function getRestaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.restaurant.name,
    telephone: siteConfig.restaurant.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.line,
      addressLocality: 'Çorlu',
      addressRegion: 'Tekirdağ',
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: siteConfig.address.lat, longitude: siteConfig.address.lng },
    openingHoursSpecification: toOpeningHours(siteConfig.restaurant.hours),
    hasMenu: `${siteConfig.siteUrl}/menu?tab=restaurant`,
    servesCuisine: 'Türk Mutfağı',
    areaServed: 'Çorlu, Tekirdağ',
    url: siteConfig.siteUrl,
  }
}

export function getBufeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FastFoodRestaurant',
    name: siteConfig.bufe.name,
    telephone: siteConfig.bufe.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.line,
      addressLocality: 'Çorlu',
      addressRegion: 'Tekirdağ',
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: siteConfig.address.lat, longitude: siteConfig.address.lng },
    openingHoursSpecification: toOpeningHours(siteConfig.bufe.hours),
    hasMenu: `${siteConfig.siteUrl}/menu?tab=bufe`,
    servesCuisine: 'Türk Mutfağı',
    areaServed: 'Çorlu, Tekirdağ',
    url: siteConfig.siteUrl,
  }
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/jsonld.test.ts`
Expected: PASS (2/2)

- [ ] **Step 5: `src/app/layout.tsx`'i güncelle — JSON-LD script'lerini ekle**

Import satırlarına ekle:

```tsx
import { getRestaurantJsonLd, getBufeJsonLd } from '@/lib/jsonld'
```

`<body ...>` açılış etiketinden hemen sonra, `<Header />`'dan ÖNCE ekle:

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getRestaurantJsonLd()) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBufeJsonLd()) }} />
```

Not: İçerik `siteConfig`'ten sunucuda üretilir, kullanıcı girdisi içermez; `dangerouslySetInnerHTML` burada güvenlidir.

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit && npm run build`
Expected: Hatasız. Build çıktısında ana sayfa HTML'inde iki adet `application/ld+json` script'i bulunmalı (`npm run build` sonrası `.next` çıktısını incelemeye gerek yok; `npm run dev` ile tarayıcı "Görünüm Kaynağı"ndan da doğrulanabilir).

- [ ] **Step 7: Commit**

```bash
git add src/lib/jsonld.ts src/lib/jsonld.test.ts src/app/layout.tsx
git commit -m "feat: Restaurant ve FastFoodRestaurant JSON-LD verisi"
```

---

### Task 46: `/qr` sayfası — QR üretme ve yazdırma

**Files:**
- Create: `src/app/qr/page.tsx`
- Modify: `src/app/globals.css` (yazdırma stilleri)

**Interfaces:**
- Consumes: `generateQrSvg` (Task 29), `siteConfig` (Task 3), `SmartImage` (Task 9), `Container` (Task 8).

- [ ] **Step 1: `src/app/qr/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Container from '@/components/ui/Container'
import SmartImage from '@/components/ui/SmartImage'
import { siteConfig } from '@/config/site'
import { generateQrSvg } from '@/lib/qr'

export const metadata: Metadata = {
  title: 'QR Kod Üret',
  robots: { index: false, follow: false },
}

const cards = [
  { title: 'Genel Menü', url: '/menu', businessName: siteConfig.brandName, phone: siteConfig.restaurant.phoneDisplay },
  { title: 'Restaurant Menüsü', url: '/menu?tab=restaurant', businessName: siteConfig.restaurant.name, phone: siteConfig.restaurant.phoneDisplay },
  { title: 'Büfe Menüsü', url: '/menu?tab=bufe', businessName: siteConfig.bufe.name, phone: siteConfig.bufe.phoneDisplay },
] as const

export default async function QrPage() {
  const svgs = await Promise.all(cards.map((card) => generateQrSvg(`${siteConfig.siteUrl}${card.url}`)))

  return (
    <Container className="py-14">
      <div className="print:hidden">
        <h1 className="font-display text-2xl font-extrabold text-ink">QR Kod Üret ve Yazdır</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Aşağıdaki kartları yazdırıp masalara yerleştirebilirsiniz. Tarayıcının "Yazdır" (Ctrl/Cmd+P) özelliğini
          kullanın — yazdırma önizlemesinde yalnızca kartlar görünür, site başlığı ve alt bilgisi gizlenir. Kartlar A5
          ve A4 kağıt boyutlarıyla uyumludur.
        </p>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-1 print:gap-6">
        {cards.map((card, i) => (
          <div key={card.url} className="qr-card flex flex-col items-center gap-4 rounded-xl border border-line p-8 text-center print:border-2 print:border-ink">
            <SmartImage slot="brand.logo" className="h-10 w-32" sizes="128px" />
            <p className="font-display text-lg font-bold text-ink">Menümüz için okutun</p>
            <div className="h-40 w-40" dangerouslySetInnerHTML={{ __html: svgs[i] }} />
            <div>
              <p className="text-sm font-semibold text-ink">{card.businessName}</p>
              <p className="text-sm text-ink-soft">{card.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
```

- [ ] **Step 2: `src/app/globals.css`'e yazdırma stillerini ekle (dosyanın sonuna)**

```css
@media print {
  header[role='banner'],
  footer,
  nav[aria-label='Hızlı işlemler'],
  button[aria-label='Sayfa başına dön'] {
    display: none !important;
  }
  body {
    padding-bottom: 0 !important;
  }
  .qr-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  @page {
    size: A4;
    margin: 12mm;
  }
}
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit`
Expected: Hatasız.

- [ ] **Step 4: Manuel doğrulama**

Run: `npm run dev`, `http://localhost:3000/qr` aç, tarayıcı yazdırma önizlemesini (Ctrl/Cmd+P) kontrol et: header/footer/mobil bar gizli, yalnızca 3 kart görünüyor, her kartta gerçek bir QR kodu render ediliyor (telefonla taratıp `/menu`, `/menu?tab=restaurant`, `/menu?tab=bufe` adreslerine gittiğini doğrula — `siteConfig.siteUrl` henüz gerçek domain olmadığından yönlendirme çalışmayabilir, bu normaldir).

- [ ] **Step 5: Commit**

```bash
git add src/app/qr/page.tsx src/app/globals.css
git commit -m "feat: /qr sayfasi (QR uretme ve yazdirma)"
```

---

### Task 47: `sitemap.ts` ve `robots.ts`

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`

**Interfaces:**
- Consumes: `siteConfig.siteUrl` (Task 3).

- [ ] **Step 1: `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/restaurant', '/bufe', '/menu', '/hakkimizda', '/iletisim']
  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/menu' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))
}
```

- [ ] **Step 2: `src/app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/qr' }],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit && npm run build`
Expected: Hatasız. `npm run dev` ile `/sitemap.xml` ve `/robots.txt` adreslerini açıp doğru içerik döndüğünü kontrol et; `/robots.txt` içinde `Disallow: /qr` satırının bulunduğunu doğrula.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: sitemap.ts ve robots.ts"
```

---

### Task 48: `IMAGES.md`

**Files:**
- Create: `IMAGES.md` (proje kök dizini)

**Interfaces:**
- Consumes: `src/config/images.ts` (Task 4, Task 36) — tablo bu dosyadaki slotlarla birebir örtüşmelidir.

- [ ] **Step 1: `IMAGES.md` dosyasını oluştur**

```markdown
# Görsel Slotları

Bu tablo, `src/config/images.ts` içindeki tüm görsel slotlarını listeler. Bir görsel eklemek için:

1. Dosyayı aşağıdaki "Dosya Yolu" sütununda belirtilen klasöre at (`public` kökünden itibaren).
2. `src/config/images.ts` içinde ilgili slotun `src` alanını doldur (örn. `src: '/images/brand/logo.png'`).
3. Başka hiçbir dosyaya dokunma — layout otomatik olarak kayar, kırık görsel/placeholder görünmez.

| Slot Key | Sayfa / Bölüm | Dosya Yolu | Oran | Önerilen Boyut | İçerik Önerisi |
|---|---|---|---|---|---|
| brand.logo | Header (koyu zemin) / Footer / /qr | /images/brand/logo.png | 200/52 | 400x104 | Koyu zeminde kullanılacak logo, şeffaf PNG/SVG |
| brand.logoLight | Header (şeffaf & sticky) / Footer | /images/brand/logo-light.png | 200/52 | 400x104 | Şeffaf header için beyaz varyant logo |
| hero.slide1 | Anasayfa Hero, slayt 1 | /images/hero/slide-1.jpg | 16/9 | 1920x1080 | Tezgahtan geniş çekim, sıcak ışık, dolu tabaklar |
| hero.slide2 | Anasayfa Hero, slayt 2 | /images/hero/slide-2.jpg | 16/9 | 1920x1080 | Büfe tezgahı, hızlı hazırlık anı, canlı renkler |
| home.welcome.1 | Anasayfa Hoşgeldiniz bloğu | /images/home/welcome-1.jpg | 3/4 | 900x1200 | Salon/masalar, sıcak atmosfer |
| home.welcome.2 | Anasayfa Hoşgeldiniz bloğu | /images/home/welcome-2.jpg | 4/5 | 900x1125 | Mutfaktan taze pişen yemek, buğu/taze doku |
| home.split.video | Anasayfa Bölünmüş Tanıtım Bandı | /images/home/split-video.jpg | 16/9 | 1280x720 | Video kapak karesi |
| home.featured.1 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-1.jpg | 1/1 | 600x600 | Mercimek çorbası, üstten açı, sade tabak |
| home.featured.2 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-2.jpg | 1/1 | 600x600 | Kuru fasulye, pilav yanında |
| home.featured.3 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-3.jpg | 1/1 | 600x600 | Zeytinyağlı taze fasulye, doğal ışık |
| home.featured.4 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-4.jpg | 1/1 | 600x600 | Karışık ızgara, doku belirgin |
| home.featured.5 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-5.jpg | 1/1 | 600x600 | Kaşarlı tost, kesit görünümü |
| home.featured.6 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-6.jpg | 1/1 | 600x600 | Sütlaç, üstten açı |
| home.mosaic.1 | Anasayfa Mozaik Banner | /images/home/mosaic-1.jpg | 1/1 | 900x900 | Restaurant salonu genel görünüm |
| home.mosaic.2 | Anasayfa Mozaik Banner | /images/home/mosaic-2.jpg | 1/1 | 900x900 | Günlük tabldot detay çekimi |
| home.mosaic.3 | Anasayfa Mozaik Banner | /images/home/mosaic-3.jpg | 1/1 | 900x900 | Büfe tezgahı genel görünüm |
| home.mosaic.4 | Anasayfa Mozaik Banner | /images/home/mosaic-4.jpg | 1/1 | 900x900 | Toplu yemek / kumanya servisi |
| home.parallax | Anasayfa Arka Plan Görselli Bölüm | /images/home/parallax.jpg | 21/9 | 2400x1000 | Lokantanın dış cephesi, geniş ve sakin |
| home.trio.1 | Anasayfa Üçlü Görsel/Video Şeridi | /images/home/trio-1.jpg | 4/3 | 1200x900 | Mutfaktan hazırlık anı |
| home.trio.2 | Anasayfa Üçlü Görsel/Video Şeridi | /images/home/trio-2.jpg | 4/3 | 1200x900 | Servis anı |
| home.trio.3 | Anasayfa Üçlü Görsel/Video Şeridi | /images/home/trio-3.jpg | 4/3 | 1200x900 | Müşteri memnuniyeti anı |
| home.blockA.1 | Anasayfa İkili Blok A (Restaurant) | /images/home/block-a-1.jpg | 3/4 | 900x1200 | Günlük tabldot çeşitleri |
| home.blockA.2 | Anasayfa İkili Blok A (Restaurant) | /images/home/block-a-2.jpg | 4/5 | 900x1125 | Salon detayı |
| home.blockB.1 | Anasayfa İkili Blok B (Büfe) | /images/home/block-b-1.jpg | 3/4 | 900x1200 | Hızlı servis anı |
| home.blockB.2 | Anasayfa İkili Blok B (Büfe) | /images/home/block-b-2.jpg | 4/5 | 900x1125 | Ürün detayı |
| home.reviews.avatar.1 | Anasayfa Müşteri Yorumları | /images/home/avatar-1.jpg | 1/1 | 200x200 | Müşteri fotoğrafı (opsiyonel, yoksa baş harf gösterilir) |
| home.reviews.avatar.2 | Anasayfa Müşteri Yorumları | /images/home/avatar-2.jpg | 1/1 | 200x200 | Müşteri fotoğrafı (opsiyonel) |
| home.reviews.avatar.3 | Anasayfa Müşteri Yorumları | /images/home/avatar-3.jpg | 1/1 | 200x200 | Müşteri fotoğrafı (opsiyonel) |
| home.reviews.avatar.4 | Anasayfa Müşteri Yorumları | /images/home/avatar-4.jpg | 1/1 | 200x200 | Müşteri fotoğrafı (opsiyonel) |
| home.reviews.avatar.5 | Anasayfa Müşteri Yorumları | /images/home/avatar-5.jpg | 1/1 | 200x200 | Müşteri fotoğrafı (opsiyonel) |
| home.reviews.avatar.6 | Anasayfa Müşteri Yorumları | /images/home/avatar-6.jpg | 1/1 | 200x200 | Müşteri fotoğrafı (opsiyonel) |
| home.gallery.1 | Anasayfa Galeri | /images/home/gallery-1.jpg | 4/3 | 1200x900 | Salon genel görünüm |
| home.gallery.2 | Anasayfa Galeri | /images/home/gallery-2.jpg | 4/3 | 1200x900 | Mutfak/hazırlık anı |
| home.gallery.3 | Anasayfa Galeri | /images/home/gallery-3.jpg | 4/3 | 1200x900 | Büfe tezgahı |
| home.gallery.4 | Anasayfa Galeri | /images/home/gallery-4.jpg | 4/3 | 1200x900 | Yemek detay çekimi |
| home.gallery.5 | Anasayfa Galeri | /images/home/gallery-5.jpg | 4/3 | 1200x900 | Müşteri/servis anı |
| home.gallery.6 | Anasayfa Galeri | /images/home/gallery-6.jpg | 4/3 | 1200x900 | Dış cephe/giriş |
| restaurant.hero | /restaurant sayfa üstü | /images/restaurant/hero.jpg | 21/9 | 2400x1000 | Salon veya sıcak yemek geniş çekim |
| restaurant.intro.1 | /restaurant tanıtım bloğu | /images/restaurant/intro-1.jpg | 4/5 | 900x1125 | Lokanta iç mekan |
| restaurant.intro.2 | /restaurant tanıtım bloğu | /images/restaurant/intro-2.jpg | 4/5 | 900x1125 | Aşçı/mutfak |
| restaurant.gallery.1 | /restaurant galeri | /images/restaurant/gallery-1.jpg | 4/3 | 1200x900 | Salon |
| restaurant.gallery.2 | /restaurant galeri | /images/restaurant/gallery-2.jpg | 4/3 | 1200x900 | Tabldot çeşitleri |
| restaurant.gallery.3 | /restaurant galeri | /images/restaurant/gallery-3.jpg | 4/3 | 1200x900 | Mutfak |
| restaurant.gallery.4 | /restaurant galeri | /images/restaurant/gallery-4.jpg | 4/3 | 1200x900 | Müşteri anı |
| bufe.hero | /bufe sayfa üstü | /images/bufe/hero.jpg | 21/9 | 2400x1000 | Büfe tezgahı geniş çekim, dinamik |
| bufe.category.1 | /bufe kategori grid'i (Tostlar) | /images/bufe/category-1.jpg | 4/3 | 900x675 | Kaşarlı tost, kesit |
| bufe.category.2 | /bufe kategori grid'i (Sandviçler) | /images/bufe/category-2.jpg | 4/3 | 900x675 | Sandviç detay |
| bufe.category.3 | /bufe kategori grid'i (Sosisli & Hamburger) | /images/bufe/category-3.jpg | 4/3 | 900x675 | Hamburger detay |
| bufe.category.4 | /bufe kategori grid'i (Kahvaltılık) | /images/bufe/category-4.jpg | 4/3 | 900x675 | Omlet/menemen |
| bufe.category.5 | /bufe kategori grid'i (Atıştırmalık) | /images/bufe/category-5.jpg | 4/3 | 900x675 | Patates kızartması |
| bufe.category.6 | /bufe kategori grid'i (İçecekler) | /images/bufe/category-6.jpg | 4/3 | 900x675 | Soğuk içecek/çay |
| about.hero | /hakkimizda sayfa üstü | /images/gallery/about-hero.jpg | 21/9 | 2400x1000 | Ekip veya mekan geniş çekim |
| about.wide | /hakkimizda "Lokantamız Hakkında" bloğu | /images/gallery/about-wide.jpg | 4/3 | 1200x900 | Görsel solda/metin sağda düzeninde tekil görsel |
| about.wideBand | /hakkimizda değerler altı tam genişlik bant | /images/gallery/about-wide-band.jpg | 16/9 | 1920x1080 | Ekip/mekan birlikte, tam genişlik |
| about.gallery.1 | /hakkimizda galeri | /images/gallery/about-1.jpg | 4/3 | 1200x900 | Mekân |
| about.gallery.2 | /hakkimizda galeri | /images/gallery/about-2.jpg | 4/3 | 1200x900 | Ekip |
| about.gallery.3 | /hakkimizda galeri | /images/gallery/about-3.jpg | 4/3 | 1200x900 | Mutfak |
| about.gallery.4 | /hakkimizda galeri | /images/gallery/about-4.jpg | 4/3 | 1200x900 | Yemek |
| about.gallery.5 | /hakkimizda galeri | /images/gallery/about-5.jpg | 4/3 | 1200x900 | Servis anı |
| about.gallery.6 | /hakkimizda galeri | /images/gallery/about-6.jpg | 4/3 | 1200x900 | Dış cephe |
| contact.hero | /iletisim üst bant arka planı | /images/gallery/contact-hero.jpg | 21/9 | 2400x600 | İnce bant, sade/koyu görsel |
| og.default | Tüm sayfalar (Open Graph paylaşım kapağı) | /images/og/default.jpg | 1200/630 | 1200x630 | Logo + marka rengi zemin |

**Not:** Menü ürün görselleri (`src/data/menu.ts` ve `src/data/bufe.ts` içindeki `image` alanı) bu tabloda yer almaz — tamamen opsiyoneldir, boş bırakılırsa ilgili menü satırı görselsiz/kompakt render edilir. Bir ürüne görsel eklemek için ilgili verideki `image: null` değerini `image: '/images/menu/<dosya-adi>.jpg'` ile değiştirmek yeterlidir.
```

- [ ] **Step 2: Commit**

```bash
git add IMAGES.md
git commit -m "docs: IMAGES.md - tum gorsel slotlarinin tablosu"
```

---

### Task 49: `README.md`

**Files:**
- Create: `README.md` (proje kök dizini)

**Interfaces:** (yok — yalnızca dokümantasyon)

- [ ] **Step 1: `README.md` dosyasını oluştur**

```markdown
# EGEM-TRAK Restaurant & EGEM Büfe — Web Sitesi

Çorlu Yeni Sanayi Bölgesi'ndeki EGEM-TRAK Restaurant ve EGEM Büfe için tanıtım sitesi ve QR menü.
Site üzerinde sepet/ödeme/sipariş akışı YOKTUR — yalnızca tanıtım ve dijital menü sunar.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

Diğer komutlar:

```bash
npm run build   # production build
npm run start   # production sunucusunu başlat (önce build gerekir)
npm run lint    # ESLint kontrolü
npm test        # Vitest test paketi
npx tsc --noEmit  # TypeScript tip kontrolü
```

## Görsel Ekleme (3 Adım)

Site şu an görselsiz kurulmuştur ve markalı placeholder'larla profesyonel görünür. Bir görsel eklemek için:

1. Dosyayı ilgili `public/images/<klasör>/` içine at (klasörler: `brand/`, `hero/`, `home/`, `restaurant/`, `bufe/`, `menu/`, `gallery/`, `og/` — hangi slotun hangi klasöre gittiğini `IMAGES.md`'den kontrol et).
2. `src/config/images.ts` içinde ilgili slotun `src` alanını doldur, örn.:
   ```ts
   'hero.slide1': slot({ ..., src: '/images/hero/slide-1.jpg' }),
   ```
   (Not: bu dosyadaki `slot()` yardımcı fonksiyonu `src`'yi varsayılan olarak `null` yapar; `src` eklemek için literal objeye `src: '...'` alanını ekleyin.)
3. Başka hiçbir dosyaya dokunmayın — sayfa otomatik olarak günceller, layout kaymaz (sabit en-boy oranı sayesinde).

Tüm slotların tam listesi ve içerik önerileri için `IMAGES.md`'ye bakın.

## İşletme Bilgisi Güncelleme

Telefon, WhatsApp, adres, harita linki, sosyal medya ve çalışma saatleri **yalnızca** `src/config/site.ts` dosyasında tutulur. Bu dosyadaki `// TODO: müşteriden alınacak` yorumlu alanları gerçek bilgilerle güncelleyin. Başka hiçbir dosyada telefon/adres hard-code edilmemiştir.

Menü/nav linklerini değiştirmek için `src/config/nav.ts`'i düzenleyin.

## Menü ve Fiyat Güncelleme

- Restaurant menüsü: `src/data/menu.ts` (`restaurantMenu` dizisi + `todaysSpecial` — bugünün tabldotu).
- Büfe menüsü: `src/data/bufe.ts` (`bufeMenu` dizisi).
- Her ürün: `{ name, desc?, price?, tags?, image? }`. `tags` şu değerleri alabilir: `'acili' | 'vejetaryen' | 'yeni' | 'gunun-yemegi'`.
- Fiyatları tüm sitede gizlemek/göstermek için `src/config/site.ts` içindeki `showPrices` bayrağını `false`/`true` yapın.
- Bir ürüne görsel eklemek isterseniz `image: null` yerine `image: '/images/menu/<dosya-adi>.jpg'` yazın; görsel eklenmişse menüde küçük bir kare thumbnail görünür, boşsa satır görselsiz/kompakt kalır.

## QR Kod Yazdırma

`/qr` sayfasını açın (bu sayfa arama motorlarına kapalıdır — `noindex`). Üç kart görünür: genel menü, yalnızca Restaurant, yalnızca Büfe. Tarayıcıda Ctrl/Cmd+P ile yazdırın; yazdırma önizlemesinde yalnızca kartlar görünür (header/footer/mobil bar otomatik gizlenir), A4 kağıda uygun şekilde biçimlenir.

QR kodların doğru adrese yönlendirmesi için önce `src/config/site.ts` içindeki `siteUrl` alanının gerçek yayın domaininizle güncellenmiş olması gerekir.

## Deploy

Proje bir Next.js (App Router) uygulamasıdır, önerilen deploy hedefi **Vercel**'dir:

1. Depoyu GitHub/GitLab'a push edin.
2. [vercel.com](https://vercel.com) üzerinde "New Project" ile depoyu içe aktarın (framework otomatik "Next.js" olarak algılanır, ek ayar gerekmez).
3. Deploy sonrası gerçek domaini bağlayın ve `src/config/site.ts` içindeki `siteUrl` değerini bu domainle güncelleyip yeniden deploy edin (sitemap/JSON-LD/QR mutlak URL'leri buna bağlıdır).

Vercel dışında herhangi bir Node.js (≥18) destekleyen sunucuda da `npm run build && npm run start` ile çalıştırılabilir.

## Proje Yapısı

```
src/app/          Sayfalar (App Router) — her klasör bir route
src/components/    layout/ (Header, Footer, MobileDrawer, ...) · ui/ (Button, SmartImage, ...) ·
                   sections/ (anasayfa & alt sayfa bölümleri) · menu/ (QR menü bileşenleri)
src/config/        site.ts (işletme bilgisi), images.ts (görsel slotları), nav.ts (menü linkleri)
src/data/          menu.ts, bufe.ts, faq.ts, reviews.ts, features.ts
src/lib/           utils.ts, hours.ts, useSlider.ts, useActiveSection.ts, menuSearch.ts, qr.ts, jsonld.ts
public/images/     Statik görseller (bkz. IMAGES.md)
```

## Test

Proje, saf mantık (açık/kapalı hesaplama, arama/filtreleme, slider index matematiği) ve etkileşimli bileşenler
(Header, Accordion, form validasyonu, modallar) için Vitest + React Testing Library testleri içerir. Salt sunum
bileşenleri (kartlar, bölümler, sayfalar) için ayrı otomatik test yazılmamıştır; bunlar `npm run build` ve manuel
tarayıcı doğrulamasıyla kontrol edilir.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README.md - kurulum, gorsel ekleme, icerik guncelleme, deploy rehberi"
```

---

### Task 50: Son doğrulama — Lighthouse, 360px, sarı oran, kabul kriterleri

**Files:** (yok — yalnızca doğrulama, gerekirse küçük düzeltmeler)

- [ ] **Step 1: Tam otomatik doğrulama**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: Hepsi hatasız/PASS.

- [ ] **Step 2: Production modda çalıştır ve Lighthouse ölç**

Run: `npm run start` (ayrı bir terminalde, `npm run build` sonrası)

Chrome DevTools → Lighthouse → Mobile → Performance/Accessibility/SEO ölç (anasayfa ve `/menu` için ayrı ayrı). Hedef: Performance 90+, Accessibility 95+, SEO 100. Eksik çıkan kalemler için (ör. eksik `alt` metni, düşük kontrast, kullanılmayan JS) ilgili dosyada küçük düzeltme yap.

- [ ] **Step 3: Kabul kriterleri kontrol listesi — spec `docs/superpowers/specs/2026-09-03-egem-trak-website-design.md` bölüm 18 ile birebir eşleştir**

Tüm sayfalarda tek tek doğrula:
- Header masaüstünde ortalanmış logo + sol ANASAYFA/RESTAURANT/BÜFE + sağ MENÜ/HAKKIMIZDA/İLETİŞİM.
- Anasayfada header hero üzerinde şeffaf, scroll'da koyu/sticky; diğer sayfalarda baştan koyu.
- Anasayfa 3 saniyede iki işletmeyi ve yönlendirmeyi anlatıyor (Mosaic + AltBlock'lar bunu netleştiriyor mu, gözden geçir).
- Hiçbir yerde fiyat kartı + sepet + satın alma hissi yok (`grep -ri "sepete ekle\|sepet\|checkout\|add to cart" src` boş dönmeli).
- Görselsiz haldeyken tüm sayfalar profesyonel görünüyor (placeholder'lar kırık görünmüyor).
- `/menu` telefonda tek elle kullanılabiliyor, kategori barı sticky çalışıyor.
- Sarı (`accent-500`) kullanımı sınırlı — `grep -rn "accent-500" src/components src/app` ile kullanım yerlerini listele, her birinin kicker/rozet/aktif durum gibi küçük vurgular olduğunu, büyük zemin/blok olmadığını doğrula.
- 360px genişlikte (`npm run dev` + DevTools 360px) hiçbir sayfada yatay kaydırma yok.
- Restaurant ve büfe dili karışmıyor (Restaurant sayfalarında büfe terminolojisi, tersi yok).
- `grep -rn "902820000\|905000000\|Yeni Sanayi" src --include="*.tsx" --include="*.ts" -l` yalnızca `src/config/site.ts`'i döndürmeli (başka dosyada hard-code telefon/adres YOK).
- Lighthouse sonuçları hedefleri karşılıyor (Adım 2).

- [ ] **Step 4: Bulunan sorunları düzelt ve commit et**

```bash
git add -A
git commit -m "fix: son dogrulama - kabul kriterleri ve lighthouse duzeltmeleri"
```

(Düzeltme gerekmediyse bu adımı atla.)

---

## Plan Sonu

Bu plan tamamlandığında: 8 sayfa, 14 anasayfa bölümü, tam görsel slot sistemi, ≥79 menü kalemi, Vitest testleriyle
korunan saf mantık/etkileşimli bileşenler, JSON-LD + sitemap + robots, yazdırılabilir QR sayfası, `README.md` ve
`IMAGES.md` teslim edilmiş olur — spec'in 20. bölümündeki tüm kabul kriterleri karşılanmış olmalıdır.
