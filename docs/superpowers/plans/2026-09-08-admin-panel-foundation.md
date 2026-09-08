# Admin Panel Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DB-backed admin panel (`/admin/*`) that manages Restaurant + Büfe menüs (kategori/ürün/fiyat/günün menüsü) and business settings, fully working and testable on its own — the public site keeps reading from its current static files until the follow-up plan (Public Site DB Integration) wires it to the same database.

**Architecture:** Prisma + PostgreSQL (Neon) as the data layer, Auth.js v5 (Credentials) for a single-admin login, Server Actions for all mutations, Zod validation client+server, a dedicated admin UI kit (own sidebar/layout, distinct from the public site's marketing components) styled with the site's existing `brand-*`/`accent-500` Tailwind tokens.

**Tech Stack:** Next.js 16 (App Router) + TypeScript strict, Tailwind CSS v3 (existing config), Prisma ORM, PostgreSQL (Neon), Auth.js v5 + bcryptjs, Zod, lucide-react, sonner, Vercel Blob + sharp (image upload/resize).

**Spec:** `docs/superpowers/specs/2026-09-08-admin-panel-design.md`

**Scope note:** this plan covers spec sections 3-7 and 9-10 (auth, data model, admin UI, acceptance for the admin side). Spec section 8 ("Canlı Site Entegrasyonu" — wiring `/`, `/menu`, `/restaurant`, `/bufe` to read from this database) is deliberately a **separate follow-up plan**, written after this one ships, per writing-plans' scope-check guidance (independently testable software per plan). Nothing in this plan touches the existing public pages/components.

## Global Constraints

- Next.js 16 App Router + TypeScript strict; no `any`.
- Tailwind v3 (already pinned in this repo) — use existing tokens only: `brand-950/900/700/600/500/200/100/50`, `accent-500`, `ink`, `ink-soft`, `line`. No new hex colors.
- Admin UI is Türkçe throughout; kod yorumları Türkçe.
- All mutations via Server Actions (no new API routes except the NextAuth handler itself).
- Zod validates every form, client AND server side.
- Reuse existing `cn`, `slugify`, `formatPrice` from `src/lib/utils.ts` — `slugify` already handles Turkish characters (tested in Task 2 of the original site plan), do not reimplement.
- Reuse `SmartImage` (`src/components/ui/SmartImage.tsx`) for the login page's logo slot — do not hardcode an `<img>`.
- Every task ends with `npx tsc --noEmit` and `npm run lint` clean; paste real command output in reports (this codebase has a strict established norm against paraphrased/fabricated tool output — write "(no output, exit code 0)" for genuinely empty output, never invent example output).
- Dokunma hedefleri (touch targets) min 44px on every interactive admin element, matching the public site's established convention.
- Confirm dialogs for every destructive action (delete category/product).
- Test policy for this plan: **full TDD (Vitest)** for pure logic (Zod schemas' parse behavior, slug-uniqueness helper, rate limiter); **no dedicated tests** for presentational admin pages/forms (verified by `tsc`/`build`/manual dev-server check instead) — matches the test policy already established in the original site's plan.

---

## Faz 1 — Veritabanı, Auth, Admin Kabuğu

### Task 1: Prisma kurulumu + şema + Prisma client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Modify: `.env.example` (append DB/auth/blob vars)
- Modify: `.gitignore` (append `.env`, `/prisma/migrations` stays tracked — do NOT ignore migrations)

**Interfaces:**
- Produces: Prisma Client singleton `db` exported from `src/lib/db.ts`, typed models `User`, `Category`, `Product`, `Settings`, `DayHours`, enum `Business` ('RESTAURANT' | 'BUFE'). Every later task imports `{ db }` from `@/lib/db` and these generated types from `@prisma/client`.

- [ ] **Step 1: Install dependencies**

```bash
npm install prisma @prisma/client
npm install -D tsx
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` (overwrite it in the next step) and a `.env` with a `DATABASE_URL` placeholder — leave `.env` as-is for now (it's gitignored).

- [ ] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Business {
  RESTAURANT
  BUFE
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         String   @default("ADMIN")
  createdAt    DateTime @default(now())
}

model Category {
  id        String    @id @default(cuid())
  business  Business
  name      String
  slug      String
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([business, slug])
  @@index([business, sortOrder])
}

model Product {
  id               String   @id @default(cuid())
  business         Business
  name             String
  code             String?
  price            Decimal  @db.Decimal(10, 2)
  calories         Int?
  shortDescription String?
  longDescription  String?
  allergens        String?
  imageUrl         String?
  isActive         Boolean  @default(true)
  isSoldOut        Boolean  @default(false)
  isDailyMenu      Boolean  @default(false)
  sortOrder        Int      @default(0)
  categoryId       String
  category         Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([categoryId, sortOrder])
  @@index([business, isDailyMenu])
}

model DayHours {
  id         String   @id @default(cuid())
  settingsId String
  settings   Settings @relation(fields: [settingsId], references: [id])
  business   Business
  weekday    Int
  isClosed   Boolean  @default(false)
  openTime   String?
  closeTime  String?

  @@unique([settingsId, business, weekday])
}

model Settings {
  id                 String     @id @default("singleton")
  brandName          String     @default("EGEM")
  tagline            String?
  aboutText          String?

  restaurantName     String     @default("EGEM-TRAK Restaurant")
  restaurantPhone    String?
  restaurantWhatsapp String?

  bufeName           String     @default("EGEM Büfe")
  bufePhone          String?
  bufeWhatsapp       String?

  address            String?
  mapEmbedUrl        String?
  directionsUrl      String?

  instagram          String?
  facebook           String?
  youtube            String?

  showPrices         Boolean    @default(true)
  themeColor         String     @default("#1A73C7")

  hours              DayHours[]
  updatedAt          DateTime   @updatedAt
}
```

- [ ] **Step 3: `src/lib/db.ts` — Prisma Client singleton (dev hot-reload safe)**

```ts
// Prisma Client tekil örneği — dev modda hot-reload'da birden fazla
// bağlantı açılmasını önlemek için global'e cache'lenir.
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

- [ ] **Step 4: `.env.example`'a ekle (dosyanın sonuna)**

```
# Veritabanı (Neon PostgreSQL) — https://neon.tech üzerinden ücretsiz oluşturulabilir
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth.js
AUTH_SECRET="npx auth secret ile üretin veya rastgele 32+ karakter bir string"
NEXTAUTH_URL="http://localhost:3000"

# İlk admin kullanıcı (yalnızca seed script'i tarafından okunur)
ADMIN_EMAIL="admin@egemtrak.com"
ADMIN_PASSWORD="güçlü-bir-şifre-belirleyin"

# Vercel Blob (görsel yükleme) — Vercel projesinin Storage sekmesinden alınır
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

- [ ] **Step 5: `.gitignore`'a ekle (zaten `.env*` benzeri bir satır var mı kontrol et, yoksa ekle)**

`.gitignore`'ı oku; `.env` veya `.env*.local` gibi bir satır yoksa ekle:
```
.env
```
(`.env.example` bu kuraldan etkilenmez çünkü tam eşleşme değil, glob değil — `.env.example` adını taşıyan dosya `.env` desenine uymaz, ayrıca zaten commit edilmiş durumda kalmalı.)

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit`
Expected: `db.ts`'te tip hatası olmamalı (Prisma Client henüz generate edilmediyse `npx prisma generate` çalıştır, sonra tekrar dene).

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma src/lib/db.ts .env.example .gitignore package.json package-lock.json
git commit -m "feat: Prisma semasi ve DB client singleton"
```

---

### Task 2: Seed script — admin kullanıcı, ayarlar, saatler, menü verisi

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (Prisma seed komutu + script ekle)

**Interfaces:**
- Consumes: `db` (Task 1), `Business` enum (Task 1), existing `src/data/menu.ts` (`restaurantMenu`), `src/data/bufe.ts` (`bufeMenu`), existing `src/config/site.ts` (`siteConfig` — saat/telefon/adres değerlerini seed verisine taşımak için referans olarak okunur, import edilmez, sadece değerler elle kopyalanır çünkü seed script'i çalışırken Next.js'in kendi modül çözümlemesi devrede olmayabilir).
- Produces: veritabanında 1 `User`, 1 `Settings` + 14 `DayHours`, Restaurant için 8 `Category`/50 `Product`, Büfe için 6 `Category`/29 `Product`.

- [ ] **Step 1: Install `bcryptjs`**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: `prisma/seed.ts` yaz**

```ts
// Veritabanını başlangıç verisiyle doldurur: admin kullanıcı, işletme
// ayarları + çalışma saatleri, ve mevcut statik menü verisinin taşınmış hali.
import { PrismaClient, Business } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL ve ADMIN_PASSWORD .env dosyasında tanımlı olmalı.')
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10)
  await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, name: 'Admin' },
  })

  await db.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      brandName: 'EGEM',
      restaurantName: 'EGEM-TRAK Restaurant',
      // TODO: müşteriden alınacak
      restaurantPhone: '+902820000001',
      restaurantWhatsapp: '905000000001',
      bufeName: 'EGEM Büfe',
      // TODO: müşteriden alınacak
      bufePhone: '+902820000002',
      bufeWhatsapp: '905000000002',
      // TODO: müşteriden alınacak
      address: 'Yeni Sanayi Bölgesi, Çorlu / Tekirdağ',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d27.8014!3d41.1590',
      directionsUrl: 'https://maps.google.com/?q=EGEM+Yeni+Sanayi+Bolgesi+Corlu',
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      youtube: 'https://youtube.com/',
      showPrices: true,
      themeColor: '#1A73C7',
    },
  })

  // weekday: 0=Pazartesi .. 6=Pazar — src/lib/hours.ts'teki WEEKDAY_ORDER ile
  // aynı sırayı takip eder (Plan B bu eşlemeyi köprüleyecek).
  const restaurantHours = [
    { weekday: 0, openTime: '08:00', closeTime: '21:00' }, // Pazartesi
    { weekday: 1, openTime: '08:00', closeTime: '21:00' },
    { weekday: 2, openTime: '08:00', closeTime: '21:00' },
    { weekday: 3, openTime: '08:00', closeTime: '21:00' },
    { weekday: 4, openTime: '08:00', closeTime: '21:00' },
    { weekday: 5, openTime: '08:00', closeTime: '21:00' },
    { weekday: 6, openTime: '09:00', closeTime: '18:00' }, // Pazar
  ]
  const bufeHours = [
    { weekday: 0, openTime: '07:00', closeTime: '22:00' },
    { weekday: 1, openTime: '07:00', closeTime: '22:00' },
    { weekday: 2, openTime: '07:00', closeTime: '22:00' },
    { weekday: 3, openTime: '07:00', closeTime: '22:00' },
    { weekday: 4, openTime: '07:00', closeTime: '22:00' },
    { weekday: 5, openTime: '07:00', closeTime: '22:00' },
    { weekday: 6, openTime: '08:00', closeTime: '20:00' },
  ]

  for (const h of restaurantHours) {
    await db.dayHours.upsert({
      where: { settingsId_business_weekday: { settingsId: 'singleton', business: Business.RESTAURANT, weekday: h.weekday } },
      update: h,
      create: { ...h, settingsId: 'singleton', business: Business.RESTAURANT, isClosed: false },
    })
  }
  for (const h of bufeHours) {
    await db.dayHours.upsert({
      where: { settingsId_business_weekday: { settingsId: 'singleton', business: Business.BUFE, weekday: h.weekday } },
      update: h,
      create: { ...h, settingsId: 'singleton', business: Business.BUFE, isClosed: false },
    })
  }

  type SeedItem = { name: string; desc?: string; price?: number; tags?: string[] }
  type SeedCategory = { key: string; title: string; items: SeedItem[] }

  const restaurantMenu: SeedCategory[] = [
    { key: 'corbalar', title: 'Çorbalar', items: [
      { name: 'Mercimek Çorbası', price: 60 },
      { name: 'Ezogelin Çorbası', price: 60 },
      { name: 'Yayla Çorbası', desc: 'Yoğurtlu, nane tereyağlı', price: 65 },
      { name: 'Domates Çorbası', price: 60 },
      { name: 'Tavuk Suyu Çorba', price: 65 },
      { name: 'Şehriye Çorbası', price: 60 },
    ] },
    { key: 'sulu-yemekler', title: 'Sulu Yemekler', items: [
      { name: 'Kuru Fasulye', desc: 'Pirinç pilavı ile servis edilir', price: 130 },
      { name: 'Etli Nohut', price: 130 },
      { name: 'Karnıyarık', price: 150 },
      { name: 'Türlü', desc: 'Mevsim sebzeleriyle', price: 140 },
      { name: 'Etli Taze Fasulye', price: 145 },
      { name: 'Patlıcan Musakka', price: 145 },
      { name: 'Etli Bamya', price: 155 },
      { name: 'Kıymalı Ispanak', price: 130 },
      { name: 'Etli Kabak', price: 135 },
      { name: 'Hünkar Beğendi', desc: 'Közlenmiş patlıcan püresi üzerinde et', price: 175 },
    ] },
    { key: 'izgara-ana-yemek', title: 'Izgara & Ana Yemek', items: [
      { name: 'Izgara Köfte', price: 190 },
      { name: 'Tavuk Şiş', price: 175 },
      { name: 'Adana Kebap', price: 220 },
      { name: 'Izgara Tavuk But', price: 165 },
      { name: 'Bonfile', price: 260 },
      { name: 'Karışık Izgara', desc: 'Köfte, tavuk şiş, kanat', price: 250 },
      { name: 'Kaburga', price: 240 },
    ] },
    { key: 'zeytinyaglilar', title: 'Zeytinyağlılar', items: [
      { name: 'Zeytinyağlı Taze Fasulye', price: 110 },
      { name: 'Zeytinyağlı Barbunya', price: 110 },
      { name: 'Zeytinyağlı Enginar', price: 140 },
      { name: 'Yaprak Sarma', price: 120 },
      { name: 'İmam Bayıldı', price: 125 },
      { name: 'Zeytinyağlı Pırasa', price: 110 },
    ] },
    { key: 'pilav-makarna', title: 'Pilav & Makarna', items: [
      { name: 'Sade Pirinç Pilavı', price: 60 },
      { name: 'Bulgur Pilavı', price: 55 },
      { name: 'Şehriyeli Pilav', price: 60 },
      { name: 'Fırın Makarna', price: 90 },
      { name: 'Nohutlu Pilav', price: 75 },
      { name: 'Domatesli Erişte', price: 70 },
    ] },
    { key: 'salata-meze', title: 'Salata & Meze', items: [
      { name: 'Çoban Salata', price: 70 },
      { name: 'Mevsim Salata', price: 65 },
      { name: 'Cacık', price: 55 },
      { name: 'Patlıcan Salatası', price: 75 },
      { name: 'Közlenmiş Biber Salatası', price: 75 },
    ] },
    { key: 'tatlilar', title: 'Tatlılar', items: [
      { name: 'Sütlaç', price: 75 },
      { name: 'Kemalpaşa Tatlısı', price: 80 },
      { name: 'Kazandibi', price: 80 },
      { name: 'Revani', price: 70 },
      { name: 'Aşure', desc: 'Mevsimlik', price: 75 },
    ] },
    { key: 'icecekler', title: 'İçecekler', items: [
      { name: 'Ayran', price: 30 },
      { name: 'Şalgam', price: 35 },
      { name: 'Soda', price: 25 },
      { name: 'Kola / Gazoz', price: 40 },
      { name: 'Çay', price: 15 },
    ] },
  ]

  const bufeMenu: SeedCategory[] = [
    { key: 'tostlar', title: 'Tostlar', items: [
      { name: 'Kaşarlı Tost', price: 70 },
      { name: 'Karışık Tost', desc: 'Kaşar, sucuk, salam', price: 90 },
      { name: 'Sucuklu Tost', price: 85 },
      { name: 'Ayvalık Tostu', desc: 'Sucuk, sosis, kaşar, salam, turşu', price: 110 },
      { name: 'Kaşarlı Sucuklu Tost', price: 90 },
      { name: 'Tavuklu Tost', price: 90 },
    ] },
    { key: 'sandvicler', title: 'Sandviçler', items: [
      { name: 'Tavuklu Sandviç', price: 110 },
      { name: 'Izgara Köfte Sandviç', price: 120 },
      { name: 'Ton Balıklı Sandviç', price: 115 },
      { name: 'Sote Kaşarlı Sandviç', price: 100 },
      { name: 'Sebzeli Sandviç', price: 90 },
    ] },
    { key: 'sosisli-hamburger', title: 'Sosisli & Hamburger', items: [
      { name: 'Klasik Sosisli', price: 75 },
      { name: 'Kaşarlı Sosisli', price: 90 },
      { name: 'Klasik Hamburger', price: 110 },
      { name: 'Kaşarlı Hamburger', price: 125 },
      { name: 'Acılı Hamburger', price: 130 },
    ] },
    { key: 'kahvaltilik', title: 'Kahvaltılık', items: [
      { name: 'Sade Omlet', price: 80 },
      { name: 'Kaşarlı Omlet', price: 95 },
      { name: 'Sucuklu Yumurta', price: 100 },
      { name: 'Menemen', price: 95 },
    ] },
    { key: 'atistirmalik', title: 'Atıştırmalık', items: [
      { name: 'Patates Kızartması', price: 70 },
      { name: 'Soğan Halkası', price: 75 },
      { name: 'Mozarella Çubuğu', price: 85 },
      { name: 'Çıtır Tavuk', price: 95 },
    ] },
    { key: 'icecekler', title: 'İçecekler', items: [
      { name: 'Çay', price: 15 },
      { name: 'Türk Kahvesi', price: 40 },
      { name: 'Ayran', price: 30 },
      { name: 'Soğuk İçecek (Kutu)', price: 45 },
      { name: 'Su', price: 15 },
    ] },
  ]

  async function seedMenu(business: Business, categories: SeedCategory[], dailyMenuNames: string[]) {
    for (const [catIndex, cat] of categories.entries()) {
      const category = await db.category.upsert({
        where: { business_slug: { business, slug: cat.key } },
        update: { name: cat.title, sortOrder: catIndex },
        create: { business, name: cat.title, slug: cat.key, sortOrder: catIndex, isActive: true },
      })

      for (const [itemIndex, item] of cat.items.entries()) {
        // Product'ta doğal bir benzersiz anahtar yok (yalnızca cuid `id`), bu yüzden
        // upsert yerine find-or-create ile idempotent hale getirilir: script'i
        // ikinci kez çalıştırmak ürünleri çoğaltmaz.
        const existing = await db.product.findFirst({
          where: { business, categoryId: category.id, name: item.name },
        })
        if (!existing) {
          await db.product.create({
            data: {
              business,
              name: item.name,
              price: item.price ?? 0,
              shortDescription: item.desc ?? null,
              sortOrder: itemIndex,
              categoryId: category.id,
              isDailyMenu: dailyMenuNames.includes(item.name),
            },
          })
        }
      }
    }
  }

  await seedMenu(Business.RESTAURANT, restaurantMenu, ['Mercimek Çorbası', 'Kuru Fasulye', 'Sade Pirinç Pilavı', 'Ayran'])
  await seedMenu(Business.BUFE, bufeMenu, [])

  console.log('Seed tamamlandı.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
```

- [ ] **Step 3: `package.json`'a seed komutu ekle**

`package.json`'ın en üst seviyesine (scripts'in dışına, örn. `name`/`version` yanına) ekle:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```
Ve `scripts` içine:
```json
"db:seed": "prisma db seed"
```

- [ ] **Step 4: Doğrula (yalnızca `DATABASE_URL` gerçek bir Neon bağlantısına ayarlandıktan sonra çalıştırılabilir)**

Eğer `.env`'de gerçek bir `DATABASE_URL` yoksa, bu adımı **NEEDS_CONTEXT** olarak raporla ve şunu iste: kullanıcının bir Neon veritabanı oluşturup connection string'i `.env`'e eklemesi gerekiyor. Varsa:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Expected: migration başarıyla uygulanır, seed "Seed tamamlandı." yazdırır. `npx prisma studio` ile (opsiyonel, tarayıcı gerektirir, atlanabilir) verinin göründüğünü teyit et; atlıyorsan bunun yerine `npx tsx -e "import {db} from './src/lib/db'; db.product.count().then(c => console.log(c))"` gibi bir komutla ürün sayısının 79 (50+29) olduğunu doğrula.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: seed script - admin kullanici, ayarlar, saatler, menu verisi"
```

---

### Task 3: Auth.js v5 kurulumu — Credentials provider, middleware koruması

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`
- Create: `src/types/next-auth.d.ts` (session tipini `id` alanıyla genişletmek için)

**Interfaces:**
- Consumes: `db` (Task 1), `User` model.
- Produces: `auth()`, `signIn()`, `signOut()`, `handlers` — `src/auth.ts`'ten export edilir. Task 5 (login sayfası) `signIn`'i, Task 6 (admin layout) `auth()`'u, Task 6'nın çıkış formu `signOut`'u kullanır.

- [ ] **Step 1: Install ve Next.js 16 uyumluluğunu doğrula**

```bash
npm install next-auth@beta
```

`npx tsc --noEmit` çalıştır. Eğer `next-auth`'ın tip tanımları Next.js 16 ile açıkça çakışan bir hata verirse (örn. `NextRequest`/`NextResponse` tipi uyuşmazlığı), bunu **BLOCKED** olarak raporla ve şu iki seçeneği dene: (a) `npm install next-auth@5.0.0-beta.25` gibi belirli bir son sürüme sabitle, (b) sorun devam ederse en güncel kararlı (`@latest`, beta etiketi olmadan varsa) sürümü dene. Hangi sürümde çalıştığını raporda net şekilde belirt — bu ileriki hiçbir görevi etkilemez, yalnızca bu adımın notudur.

- [ ] **Step 2: `src/types/next-auth.d.ts` — session tipini genişlet**

```ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
```

- [ ] **Step 3: `src/auth.ts`**

```ts
// Auth.js (NextAuth v5) yapılandırması — tek admin kullanıcı, Credentials provider.
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === 'string' ? credentials.email : undefined
        const password = typeof credentials?.password === 'string' ? credentials.password : undefined
        if (!email || !password) return null

        const user = await db.user.findUnique({ where: { email } })
        if (!user) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name ?? undefined }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id as string
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
})
```

- [ ] **Step 4: `src/app/api/auth/[...nextauth]/route.ts`**

```ts
export { GET, POST } from '@/auth'
```

Not: bazı `next-auth@beta` sürümlerinde `src/auth.ts`'in export ettiği isim `handlers` olup route dosyasında `import { handlers } from '@/auth'; export const { GET, POST } = handlers` şeklinde de yazılabilir — Adım 1'de kurduğun sürümün hangi deseni beklediğini `node_modules/next-auth`'ın kendi tip tanımlarından/README'sinden teyit et, ikisi de fonksiyonel olarak eşdeğerdir.

- [ ] **Step 5: `src/middleware.ts`**

```ts
// /admin/* altındaki her sayfayı korur, /admin/login hariç.
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${callbackUrl}`, req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız (Adım 1'de not edilen sürüm ayarlamaları dışında).

- [ ] **Step 7: Commit**

```bash
git add src/auth.ts src/app/api/auth src/middleware.ts src/types/next-auth.d.ts package.json package-lock.json
git commit -m "feat: Auth.js v5 kurulumu ve /admin middleware korumasi"
```

---

### Task 4: Rate limiter (tam TDD)

**Files:**
- Create: `src/lib/rate-limit.ts`, `src/lib/rate-limit.test.ts`

**Interfaces:**
- Produces: `checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number }`, `resetRateLimit(key: string): void`. Task 5'in login server action'ı bunu kullanır.

- [ ] **Step 1: `src/lib/rate-limit.test.ts` — başarısız testleri yaz**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, resetRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetRateLimit('1.2.3.4')
  })

  it('ilk 5 denemeye izin verir', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4').allowed).toBe(true)
    }
  })

  it('6. denemeyi 1 dakika içinde reddeder', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    const result = checkRateLimit('1.2.3.4')
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('1 dakika sonra tekrar izin verir', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    expect(checkRateLimit('1.2.3.4').allowed).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('1.2.3.4').allowed).toBe(true)
  })

  it('farklı anahtarlar birbirini etkilemez', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    expect(checkRateLimit('5.6.7.8').allowed).toBe(true)
  })

  it('resetRateLimit sayaci sifirlar', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    expect(checkRateLimit('1.2.3.4').allowed).toBe(false)
    resetRateLimit('1.2.3.4')
    expect(checkRateLimit('1.2.3.4').allowed).toBe(true)
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: FAIL — `Cannot find module './rate-limit'`

- [ ] **Step 3: `src/lib/rate-limit.ts` implementasyonu**

```ts
// Basit in-memory login rate limiter — süreç yeniden başladığında sıfırlanır,
// tek sunuculu/az trafikli bir admin paneli için yeterlidir.
const WINDOW_MS = 60_000
const MAX_ATTEMPTS = 5

type Entry = { count: number; resetAt: number }

const attempts = new Map<string, Entry>()

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count += 1
  return { allowed: true }
}

export function resetRateLimit(key: string): void {
  attempts.delete(key)
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: PASS (5/5)

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/rate-limit.test.ts
git commit -m "feat: login rate limiter (tam TDD)"
```

---

### Task 5: Login sayfası (`/admin/login`)

**Files:**
- Create: `src/lib/actions/login.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/login/layout.tsx` (admin kabuğunun sidebar'ını miras almasın diye ayrı, minimal bir layout)

**Interfaces:**
- Consumes: `signIn` (Task 3), `checkRateLimit`/`resetRateLimit` (Task 4), `SmartImage` (mevcut `src/components/ui/SmartImage.tsx`, `brand.logoLight` slotu).
- Produces: `loginAction(prevState: LoginState, formData: FormData): Promise<LoginState>`, `type LoginState = { error?: string }`.

- [ ] **Step 1: `src/lib/actions/login.ts`**

```ts
'use server'
// Login form'unun Server Action'ı — rate limit + Auth.js signIn + tek tip hata mesajı.
import { headers } from 'next/headers'
import { AuthError } from 'next-auth'
import { signIn } from '@/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export type LoginState = { error?: string }

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const callbackUrlRaw = formData.get('callbackUrl')
  const redirectTo = typeof callbackUrlRaw === 'string' && callbackUrlRaw ? callbackUrlRaw : '/admin/dashboard'

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const rate = checkRateLimit(ip)
  if (!rate.allowed) {
    return { error: 'Çok fazla deneme yapıldı. Lütfen 1 dakika sonra tekrar deneyin.' }
  }

  try {
    // Başarılı girişte signIn bir yönlendirme (redirect) fırlatır — bu nedenle
    // bu satırın altına başarı durumuna özel kod YAZILMAZ, asla çalışmaz.
    await signIn('credentials', { email, password, redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-posta veya şifre hatalı.' }
    }
    // AuthError değilse bu, signIn'in başarı durumunda fırlattığı yönlendirme
    // hatasıdır (veya beklenmeyen bir hata) — Next.js'in işlemesi için yeniden fırlatılır.
    throw error
  }

  return {}
}
```

- [ ] **Step 2: `src/app/admin/login/layout.tsx` — sidebar'sız minimal layout**

```tsx
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 3: `src/app/admin/login/page.tsx`**

```tsx
'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import SmartImage from '@/components/ui/SmartImage'
import { loginAction, type LoginState } from '@/lib/actions/login'

const initialState: LoginState = {}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? ''
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-brand-900 p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <div className="h-11 w-40 overflow-hidden rounded-xl border-2 border-white/20">
            <SmartImage slot="brand.logoLight" className="h-full w-full" sizes="160px" dark />
          </div>
        </div>
        <p className="mb-6 text-center text-sm text-white/70">Menü yönetim panelinize hoş geldiniz.</p>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-white">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@egemtrak.com"
              className="min-h-[44px] w-full rounded-lg border-0 px-3 text-[15px] text-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-white">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="min-h-[44px] w-full rounded-lg border-0 px-3 text-[15px] text-ink"
            />
          </div>

          {state.error && (
            <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] w-full rounded-lg bg-ink text-[15px] font-semibold text-white disabled:opacity-60"
          >
            {isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

Not: `brand.logoLight` slotunun gerçek en-boy oranı (200/52) pasted prompt'taki "kare logo kutusu" isteğiyle birebir uyuşmuyor — kareye zorlamak logoyu `object-cover` ile önemli ölçüde kırpardı. Bunun yerine slotun gerçek oranına yakın, yuvarlatılmış dikdörtgen bir kutu kullanılır (`h-11 w-40`); görsel amaç (ortalanmış, beyaz kenarlıklı logo alanı) korunur.

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız. (`useActionState` React 19'da mevcuttur, bu projede React 19.2.8 kurulu.)

- [ ] **Step 5: Manuel doğrulama**

`DATABASE_URL` gerçek bir Neon bağlantısına ayarlıysa ve Task 2'nin seed'i çalıştırıldıysa: `npm run dev`, `http://localhost:3000/admin/login` aç, `.env`'deki `ADMIN_EMAIL`/`ADMIN_PASSWORD` ile giriş yapmayı dene — `/admin/dashboard`'a yönlenmeli (Task 7'de bu sayfa henüz yoksa 404 alman normal, önemli olan yönlendirmenin gerçekleşmesi). Yanlış şifreyle "E-posta veya şifre hatalı." mesajının çıktığını doğrula. `DATABASE_URL` yoksa bu adımı NEEDS_CONTEXT olarak not düş ve devam et.

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/login.ts src/app/admin/login
git commit -m "feat: /admin/login sayfasi"
```

---

### Task 6: Admin kabuğu — sidebar, mobil drawer, oturum koruması, çıkış

**Files:**
- Create: `src/lib/actions/logout.ts`
- Create: `src/config/admin-nav.ts`
- Create: `src/components/admin/Sidebar.tsx`
- Create: `src/components/admin/AdminShell.tsx`
- Create: `src/app/admin/(panel)/layout.tsx`
- Create: `src/app/admin/(panel)/page.tsx`

**Interfaces:**
- Consumes: `auth`, `signOut` (Task 3), `cn` (`src/lib/utils.ts`), `SmartImage` (mevcut).
- Produces: `<AdminShell userEmail={string}>` — Task 7 ve sonraki tüm sayfa görevleri bu layout'un `children`'ı olarak render edilir. `adminNav` dizisi — sidebar linklerinin tek kaynağı.

**Önemli routing notu:** `/admin/login` (Task 5) bu görevin oluşturduğu oturum-korumalı layout'un **dışında** kalmalı — aksi halde giriş sayfası sonsuz yönlendirme döngüsüne girer. Bunu sağlamak için korumalı alan bir **route group** (`(panel)`) içine alınır; route group URL'e yansımaz (`/admin/(panel)/dashboard` → `/admin/dashboard`), ama Next.js'in layout kapsamını `login/` klasöründen ayırır.

- [ ] **Step 1: `src/lib/actions/logout.ts`**

```ts
'use server'
import { signOut } from '@/auth'

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
```

- [ ] **Step 2: `src/config/admin-nav.ts`**

```ts
// Sidebar navigasyonunun tek kaynağı.
export type AdminIcon = 'grid' | 'tag' | 'box' | 'calendar' | 'settings'

export type AdminNavLink = { type: 'link'; label: string; href: string; icon: AdminIcon }
export type AdminNavGroup = { type: 'group'; label: string; items: { label: string; href: string; icon: AdminIcon }[] }
export type AdminNavEntry = AdminNavLink | AdminNavGroup

export const adminNav: AdminNavEntry[] = [
  { type: 'link', label: 'Dashboard', href: '/admin/dashboard', icon: 'grid' },
  {
    type: 'group',
    label: 'Restaurant',
    items: [
      { label: 'Kategoriler', href: '/admin/restaurant/kategoriler', icon: 'tag' },
      { label: 'Ürünler', href: '/admin/restaurant/urunler', icon: 'box' },
      { label: 'Günün Menüsü', href: '/admin/restaurant/gunun-menusu', icon: 'calendar' },
    ],
  },
  {
    type: 'group',
    label: 'Büfe',
    items: [
      { label: 'Kategoriler', href: '/admin/bufe/kategoriler', icon: 'tag' },
      { label: 'Ürünler', href: '/admin/bufe/urunler', icon: 'box' },
      { label: 'Günün Menüsü', href: '/admin/bufe/gunun-menusu', icon: 'calendar' },
    ],
  },
  { type: 'link', label: 'Ayarlar', href: '/admin/settings', icon: 'settings' },
]
```

- [ ] **Step 3: `src/components/admin/Sidebar.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Tag, Box, Calendar, Settings, LogOut, User } from 'lucide-react'
import SmartImage from '@/components/ui/SmartImage'
import { adminNav, type AdminIcon } from '@/config/admin-nav'
import { logoutAction } from '@/lib/actions/logout'
import { cn } from '@/lib/utils'

const iconMap: Record<AdminIcon, typeof LayoutGrid> = {
  grid: LayoutGrid,
  tag: Tag,
  box: Box,
  calendar: Calendar,
  settings: Settings,
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: AdminIcon; active: boolean }) {
  const Icon = iconMap[icon]
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-[14px] font-medium',
        active ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  )
}

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="flex h-full w-64 flex-col bg-brand-950 px-4 py-6 text-white">
      <div className="mb-6 flex justify-center">
        <div className="h-10 w-36 overflow-hidden rounded-lg border border-white/20">
          <SmartImage slot="brand.logoLight" className="h-full w-full" sizes="144px" dark />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {adminNav.map((entry) =>
          entry.type === 'link' ? (
            <NavLink key={entry.href} href={entry.href} label={entry.label} icon={entry.icon} active={isActive(entry.href)} />
          ) : (
            <div key={entry.label} className="mt-3 first:mt-0">
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">{entry.label}</p>
              <div className="flex flex-col gap-1">
                {entry.items.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={isActive(item.href)} />
                ))}
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-2 flex items-center gap-2 px-3 text-xs text-white/50">
          <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{userEmail}</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: `src/components/admin/AdminShell.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Menu as MenuIcon, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

export default function AdminShell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-brand-50">
      <div className="hidden lg:block">
        <Sidebar userEmail={userEmail} />
      </div>

      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-brand-950 px-4 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Menüyü aç"
          className="flex h-11 w-11 items-center justify-center text-white"
        >
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <span className="text-sm font-semibold text-white">EGEM Admin</span>
        <div className="w-11" aria-hidden="true" />
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin menüsü"
        inert={!drawerOpen ? true : undefined}
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn('absolute inset-0 bg-black/50 transition-opacity duration-200', drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
        />
        <div className={cn('absolute inset-y-0 left-0 transition-transform duration-200', drawerOpen ? 'translate-x-0' : '-translate-x-full')}>
          <div className="relative h-full">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Menüyü kapat"
              className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <Sidebar userEmail={userEmail} />
          </div>
        </div>
      </div>

      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: `src/app/admin/(panel)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/admin/login')
  }

  return <AdminShell userEmail={session.user.email}>{children}</AdminShell>
}
```

- [ ] **Step 6: `src/app/admin/(panel)/page.tsx`**

```tsx
import { redirect } from 'next/navigation'

export default function AdminRootPage() {
  redirect('/admin/dashboard')
}
```

- [ ] **Step 7: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız. (`/admin/dashboard` henüz Task 7'de oluşturulmadığı için bu aşamada 404 vermesi normaldir — build/typecheck'i etkilemez.)

- [ ] **Step 8: Commit**

```bash
git add src/lib/actions/logout.ts src/config/admin-nav.ts src/components/admin src/app/admin/\(panel\)
git commit -m "feat: admin kabugu (sidebar, mobil drawer, oturum korumasi)"
```

---

### Task 7: Dashboard sayfası

**Files:**
- Create: `src/lib/queries/dashboard.ts`
- Create: `src/components/admin/StatCard.tsx`
- Create: `src/app/admin/(panel)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `db` (Task 1), `Business` enum.
- Produces: `getBusinessStats(business: Business): Promise<BusinessStats>` — `type BusinessStats = { totalProducts: number; activeProducts: number; soldOutProducts: number; dailyMenuProducts: number; totalCategories: number }`.

- [ ] **Step 1: `src/lib/queries/dashboard.ts`**

```ts
import { db } from '@/lib/db'
import type { Business } from '@prisma/client'

export type BusinessStats = {
  totalProducts: number
  activeProducts: number
  soldOutProducts: number
  dailyMenuProducts: number
  totalCategories: number
}

export async function getBusinessStats(business: Business): Promise<BusinessStats> {
  const [totalProducts, activeProducts, soldOutProducts, dailyMenuProducts, totalCategories] = await Promise.all([
    db.product.count({ where: { business } }),
    db.product.count({ where: { business, isActive: true } }),
    db.product.count({ where: { business, isSoldOut: true } }),
    db.product.count({ where: { business, isDailyMenu: true } }),
    db.category.count({ where: { business } }),
  ])
  return { totalProducts, activeProducts, soldOutProducts, dailyMenuProducts, totalCategories }
}
```

- [ ] **Step 2: `src/components/admin/StatCard.tsx`**

```tsx
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export default function StatCard({ label, value, icon: Icon, href }: { label: string; value: number; icon: LucideIcon; href: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-brand-50">
      <Icon className="h-5 w-5 text-brand-500" aria-hidden="true" />
      <span className="font-display text-2xl font-bold text-ink">{value}</span>
      <span className="text-xs text-ink-soft">{label}</span>
    </Link>
  )
}
```

- [ ] **Step 3: `src/app/admin/(panel)/dashboard/page.tsx`**

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { Package, CheckCircle2, XCircle, CalendarCheck, Tag } from 'lucide-react'
import { getBusinessStats } from '@/lib/queries/dashboard'
import StatCard from '@/components/admin/StatCard'

export const metadata: Metadata = { title: 'Dashboard | Egem Restaurant Menü Yönetim' }

export default async function DashboardPage() {
  const [restaurantStats, bufeStats] = await Promise.all([
    getBusinessStats('RESTAURANT'),
    getBusinessStats('BUFE'),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Egem Restaurant menü yönetim panelinize hoş geldiniz.</p>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">Restaurant</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Toplam Ürün" value={restaurantStats.totalProducts} icon={Package} href="/admin/restaurant/urunler" />
          <StatCard label="Aktif Ürün" value={restaurantStats.activeProducts} icon={CheckCircle2} href="/admin/restaurant/urunler" />
          <StatCard label="Tükendi" value={restaurantStats.soldOutProducts} icon={XCircle} href="/admin/restaurant/urunler" />
          <StatCard label="Günün Menüsü" value={restaurantStats.dailyMenuProducts} icon={CalendarCheck} href="/admin/restaurant/gunun-menusu" />
          <StatCard label="Kategori" value={restaurantStats.totalCategories} icon={Tag} href="/admin/restaurant/kategoriler" />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">Büfe</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Toplam Ürün" value={bufeStats.totalProducts} icon={Package} href="/admin/bufe/urunler" />
          <StatCard label="Aktif Ürün" value={bufeStats.activeProducts} icon={CheckCircle2} href="/admin/bufe/urunler" />
          <StatCard label="Tükendi" value={bufeStats.soldOutProducts} icon={XCircle} href="/admin/bufe/urunler" />
          <StatCard label="Günün Menüsü" value={bufeStats.dailyMenuProducts} icon={CalendarCheck} href="/admin/bufe/gunun-menusu" />
          <StatCard label="Kategori" value={bufeStats.totalCategories} icon={Tag} href="/admin/bufe/kategoriler" />
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/admin/restaurant/kategoriler" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Kategori Yönet
          </Link>
          <Link href="/admin/restaurant/urunler/yeni" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Ürün Ekle
          </Link>
          <Link href="/admin/restaurant/gunun-menusu" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Günün Menüsü
          </Link>
          <Link href="/admin/settings" className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-950 px-4 text-center text-sm font-semibold text-white">
            Ayarlar
          </Link>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 5: Commit**

```bash
git add src/lib/queries/dashboard.ts src/components/admin/StatCard.tsx "src/app/admin/(panel)/dashboard"
git commit -m "feat: admin dashboard sayfasi"
```

---

## Faz 2 — Kategoriler

### Task 8: Paylaşılan admin UI parçaları — Modal, ConfirmDialog, Toggle

**Files:**
- Create: `src/components/admin/Modal.tsx`
- Create: `src/components/admin/ConfirmDialog.tsx`
- Create: `src/components/admin/Toggle.tsx`

**Interfaces:**
- Produces: `<Modal open title onClose>{children}</Modal>`, `<ConfirmDialog open title description confirmLabel? onConfirm onCancel />`, `<Toggle checked onChange disabled? label />`. Task 10 (Kategoriler), Task 12-13 (Ürünler), Task 14 (Günün Menüsü) bunları kullanır.

- [ ] **Step 1: `src/components/admin/Modal.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Kapat" className="flex h-11 w-11 items-center justify-center text-ink-soft">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `src/components/admin/ConfirmDialog.tsx`**

```tsx
'use client'
import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Sil',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div role="alertdialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="min-h-[44px] rounded-lg border border-line px-4 text-sm font-semibold text-ink">
            Vazgeç
          </button>
          <button onClick={onConfirm} className="min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: `src/components/admin/Toggle.tsx`**

```tsx
'use client'
import { cn } from '@/lib/utils'

export default function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand-500' : 'bg-line'
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/Modal.tsx src/components/admin/ConfirmDialog.tsx src/components/admin/Toggle.tsx
git commit -m "feat: paylasilan admin UI parcalari (Modal, ConfirmDialog, Toggle)"
```

---

### Task 9: Kategori sorgu/mutasyon katmanı (tam TDD — slug üretimi)

**Files:**
- Create: `src/lib/queries/categories.ts`
- Create: `src/lib/actions/categories.ts`
- Create: `src/lib/slug.test.ts` (slug benzersizliği mantığı için)

**Interfaces:**
- Consumes: `db`, `Business` (Task 1), `slugify` (mevcut `src/lib/utils.ts`).
- Produces: `getCategories(business: Business): Promise<CategoryWithCount[]>` — `type CategoryWithCount = Category & { _count: { products: number } }`; server actions `createCategory(business, formData)`, `updateCategory(id, formData)`, `deleteCategory(id)`, `moveCategory(id, direction: 'up' | 'down')`, hepsi `Promise<{ error?: string }>` döner (`undefined error` = başarı). `generateUniqueSlug(business, name, excludeId?): Promise<string>` — Task 10 doğrudan kullanmaz ama actions içinde kullanılır, ayrı test edilir.

- [ ] **Step 1: `src/lib/slug.test.ts` — başarısız test yaz**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateUniqueSlug } from './queries/categories'

vi.mock('@/lib/db', () => ({
  db: { category: { findFirst: vi.fn() } },
}))

import { db } from '@/lib/db'

describe('generateUniqueSlug', () => {
  beforeEach(() => vi.clearAllMocks())

  it('çakışma yoksa temel slug\'ı döner', async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    const slug = await generateUniqueSlug('RESTAURANT', 'Çorbalar')
    expect(slug).toBe('corbalar')
  })

  it('çakışma varsa -2 ekler', async () => {
    vi.mocked(db.category.findFirst)
      .mockResolvedValueOnce({ id: 'existing' } as never)
      .mockResolvedValueOnce(null)
    const slug = await generateUniqueSlug('RESTAURANT', 'Çorbalar')
    expect(slug).toBe('corbalar-2')
  })

  it('kendi id\'sini hariç tutar (düzenleme senaryosu)', async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    await generateUniqueSlug('RESTAURANT', 'Çorbalar', 'cat-1')
    expect(db.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { not: 'cat-1' } }) })
    )
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/slug.test.ts`
Expected: FAIL — `Cannot find module './queries/categories'`

- [ ] **Step 3: `src/lib/queries/categories.ts`**

```ts
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'
import type { Business, Category } from '@prisma/client'

export type CategoryWithCount = Category & { _count: { products: number } }

export async function getCategories(business: Business): Promise<CategoryWithCount[]> {
  return db.category.findMany({
    where: { business },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })
}

export async function generateUniqueSlug(business: Business, name: string, excludeId?: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let suffix = 2

  while (true) {
    const existing = await db.category.findFirst({
      where: {
        business,
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
    if (!existing) return slug
    slug = `${base}-${suffix}`
    suffix += 1
  }
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/lib/slug.test.ts`
Expected: PASS (3/3)

- [ ] **Step 5: `src/lib/actions/categories.ts`**

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateUniqueSlug } from '@/lib/queries/categories'
import type { Business } from '@prisma/client'

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Kategori adı zorunludur.').max(80, 'Kategori adı çok uzun.'),
})

export async function createCategory(business: Business, formData: FormData): Promise<{ error?: string }> {
  const parsed = categorySchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const slug = await generateUniqueSlug(business, parsed.data.name)
  const maxSort = await db.category.aggregate({ where: { business }, _max: { sortOrder: true } })

  await db.category.create({
    data: {
      business,
      name: parsed.data.name,
      slug,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  })

  revalidatePath(business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error?: string }> {
  const parsed = categorySchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const category = await db.category.findUnique({ where: { id } })
  if (!category) return { error: 'Kategori bulunamadı.' }

  const slug = await generateUniqueSlug(category.business, parsed.data.name, id)
  await db.category.update({ where: { id }, data: { name: parsed.data.name, slug } })

  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const category = await db.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })
  if (!category) return { error: 'Kategori bulunamadı.' }
  if (category._count.products > 0) {
    return { error: 'Bu kategoride ürünler var. Önce ürünleri taşıyın veya silin.' }
  }

  await db.category.delete({ where: { id } })
  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function toggleCategoryActive(id: string, isActive: boolean): Promise<{ error?: string }> {
  const category = await db.category.update({ where: { id }, data: { isActive } })
  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}

export async function moveCategory(id: string, direction: 'up' | 'down'): Promise<{ error?: string }> {
  const category = await db.category.findUnique({ where: { id } })
  if (!category) return { error: 'Kategori bulunamadı.' }

  const neighbor = await db.category.findFirst({
    where: {
      business: category.business,
      sortOrder: direction === 'up' ? { lt: category.sortOrder } : { gt: category.sortOrder },
    },
    orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
  })
  if (!neighbor) return {}

  await db.$transaction([
    db.category.update({ where: { id: category.id }, data: { sortOrder: neighbor.sortOrder } }),
    db.category.update({ where: { id: neighbor.id }, data: { sortOrder: category.sortOrder } }),
  ])

  revalidatePath(category.business === 'RESTAURANT' ? '/admin/restaurant/kategoriler' : '/admin/bufe/kategoriler')
  return {}
}
```

- [ ] **Step 6: Install `zod`**

```bash
npm install zod
```

- [ ] **Step 7: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npx vitest run src/lib/slug.test.ts`
Expected: Hepsi hatasız/PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/queries/categories.ts src/lib/actions/categories.ts src/lib/slug.test.ts package.json package-lock.json
git commit -m "feat: kategori sorgu/mutasyon katmani (tam TDD slug uretimi)"
```

---

### Task 10: Kategoriler sayfası (Restaurant + Büfe)

**Files:**
- Create: `src/components/admin/CategoriesPage.tsx`
- Create: `src/app/admin/(panel)/restaurant/kategoriler/page.tsx`
- Create: `src/app/admin/(panel)/bufe/kategoriler/page.tsx`
- Modify: `src/components/admin/AdminShell.tsx` (add `<Toaster />` for sonner toasts)

**Interfaces:**
- Consumes: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `toggleCategoryActive`, `moveCategory` (Task 9), `Modal`, `ConfirmDialog`, `Toggle` (Task 8).
- Produces: `<CategoriesPage business="RESTAURANT" | "BUFE" />` — hem `/admin/restaurant/kategoriler` hem `/admin/bufe/kategoriler` bu tek bileşeni kullanır.

- [ ] **Step 1: `src/components/admin/CategoriesPage.tsx`**

```tsx
'use client'
import { useState, useTransition } from 'react'
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import Toggle from './Toggle'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  moveCategory,
} from '@/lib/actions/categories'
import type { CategoryWithCount } from '@/lib/queries/categories'
import type { Business } from '@prisma/client'

export default function CategoriesPage({
  business,
  initialCategories,
}: {
  business: Business
  initialCategories: CategoryWithCount[]
}) {
  const [categories, setCategories] = useState(initialCategories)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null)
  const [formError, setFormError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  function closeModal() {
    setModalMode(null)
    setEditingCategory(null)
    setFormError(undefined)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, formData)
        : await createCategory(business, formData)

      if (result.error) {
        setFormError(result.error)
        return
      }
      toast.success(editingCategory ? 'Kategori güncellendi.' : 'Kategori eklendi.')
      closeModal()
      // Sunucu Server Action içinde revalidatePath çağırdığı için Next.js
      // bir sonraki navigasyonda güncel veriyi getirir; anlık local state'i
      // de senkron tutmak için burada window.location yerine basit bir
      // optimistic ekleme/güncelleme yapılır.
      window.location.reload()
    })
  }

  function handleDelete() {
    if (!deletingCategory) return
    startTransition(async () => {
      const result = await deleteCategory(deletingCategory.id)
      if (result.error) {
        toast.error(result.error)
        setDeletingCategory(null)
        return
      }
      toast.success('Kategori silindi.')
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id))
      setDeletingCategory(null)
    })
  }

  function handleToggle(category: CategoryWithCount, next: boolean) {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, isActive: next } : c)))
    startTransition(async () => {
      const result = await toggleCategoryActive(category.id, next)
      if (result.error) {
        toast.error(result.error)
        setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, isActive: !next } : c)))
      }
    })
  }

  function handleMove(category: CategoryWithCount, direction: 'up' | 'down') {
    startTransition(async () => {
      await moveCategory(category.id, direction)
      window.location.reload()
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Kategoriler</h1>
          <p className="mt-1 text-sm text-ink-soft">Menü kategorilerini yönetin, sıralayın ve aktif/pasif yapın.</p>
        </div>
        <button
          onClick={() => setModalMode('create')}
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Kategori Ekle
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Ürün Sayısı</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMove(category, 'up')}
                      disabled={index === 0 || isPending}
                      aria-label="Yukarı taşı"
                      className="flex h-8 w-8 items-center justify-center rounded text-ink-soft disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleMove(category, 'down')}
                      disabled={index === categories.length - 1 || isPending}
                      aria-label="Aşağı taşı"
                      className="flex h-8 w-8 items-center justify-center rounded text-ink-soft disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">{category.name}</td>
                <td className="px-4 py-3 text-ink-soft">{category.slug}</td>
                <td className="px-4 py-3 text-ink-soft">{category._count.products}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={category.isActive}
                      onChange={(next) => handleToggle(category, next)}
                      label={`${category.name} durumu`}
                    />
                    <span className="text-xs text-ink-soft">{category.isActive ? 'Aktif' : 'Pasif'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setModalMode('edit')
                      }}
                      aria-label={`${category.name} düzenle`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(category)}
                      aria-label={`${category.name} sil`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Henüz kategori eklenmemiş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalMode !== null} title={editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'} onClose={closeModal}>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {editingCategory && <p className="text-sm text-ink-soft">{editingCategory.name} kategorisini düzenliyorsunuz.</p>}
          {!editingCategory && <p className="text-sm text-ink-soft">Menüde görünecek yeni bir kategori oluşturun.</p>}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
              Kategori Adı
            </label>
            <input
              id="name"
              name="name"
              defaultValue={editingCategory?.name ?? ''}
              placeholder="Örn: Günün Çorbaları"
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
            {formError && <p className="mt-1 text-xs text-red-600">{formError}</p>}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] w-full rounded-lg bg-brand-500 text-sm font-semibold text-white disabled:opacity-60"
          >
            {editingCategory ? 'Güncelle' : 'Ekle'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={deletingCategory !== null}
        title="Kategoriyi Sil"
        description={`"${deletingCategory?.name}" silinecek. Emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: `src/app/admin/(panel)/restaurant/kategoriler/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import CategoriesPage from '@/components/admin/CategoriesPage'

export const metadata: Metadata = { title: 'Restaurant Kategorileri | Egem Restaurant Menü Yönetim' }

export default async function RestaurantCategoriesPage() {
  const categories = await getCategories('RESTAURANT')
  return <CategoriesPage business="RESTAURANT" initialCategories={categories} />
}
```

- [ ] **Step 3: `src/app/admin/(panel)/bufe/kategoriler/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import CategoriesPage from '@/components/admin/CategoriesPage'

export const metadata: Metadata = { title: 'Büfe Kategorileri | Egem Restaurant Menü Yönetim' }

export default async function BufeCategoriesPage() {
  const categories = await getCategories('BUFE')
  return <CategoriesPage business="BUFE" initialCategories={categories} />
}
```

- [ ] **Step 4: Install `sonner`**

```bash
npm install sonner
```

Toast'ların görünmesi için `src/app/admin/(panel)/layout.tsx`'e (Task 6) `<Toaster />` ekle — `AdminShell`'in içine, `children`'dan hemen önce veya sonra:

```tsx
import { Toaster } from 'sonner'
// ...AdminShell.tsx içinde, en dış <div>'in içine (herhangi bir yere, sabit konumlu olduğu için):
<Toaster position="top-center" />
```

- [ ] **Step 5: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 6: Manuel doğrulama**

`DATABASE_URL` gerçek bağlantıya ayarlıysa: `npm run dev`, giriş yap, `/admin/restaurant/kategoriler` aç — seed'den gelen 8 kategori görünmeli, ekleme/düzenleme/silme/sıralama/aktiflik test et, dolu bir kategoriyi silmeyi dene ve hata mesajını doğrula. `/admin/bufe/kategoriler`'de aynısını 6 kategori için tekrarla.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/CategoriesPage.tsx "src/app/admin/(panel)/restaurant/kategoriler" "src/app/admin/(panel)/bufe/kategoriler" src/components/admin/AdminShell.tsx package.json package-lock.json
git commit -m "feat: Kategoriler sayfasi (Restaurant + Bufe)"
```

---

## Faz 3 — Ürünler

### Task 11: Ürün sorgu/mutasyon katmanı + görsel yükleme

**Files:**
- Create: `src/lib/queries/products.ts`
- Create: `src/lib/actions/products.ts`
- Create: `src/lib/actions/upload.ts`

**Interfaces:**
- Consumes: `db`, `Business` (Task 1).
- Produces: `getProducts(business, opts?: { search?: string; categoryId?: string })`, `getProductById(id)`, `type ProductWithCategory = Product & { category: Category }`; actions `createProduct`, `updateProduct`, `deleteProduct`, `toggleProductField(id, field: 'isSoldOut' | 'isDailyMenu' | 'isActive', value: boolean)`; `uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }>`. Task 12/13/14 bunları kullanır.

- [ ] **Step 1: `src/lib/queries/products.ts`**

```ts
import { db } from '@/lib/db'
import type { Business, Product, Category } from '@prisma/client'

export type ProductWithCategory = Product & { category: Category }

export async function getProducts(
  business: Business,
  opts?: { search?: string; categoryId?: string }
): Promise<ProductWithCategory[]> {
  return db.product.findMany({
    where: {
      business,
      ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts?.search ? { name: { contains: opts.search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    include: { category: true },
  })
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  return db.product.findUnique({ where: { id }, include: { category: true } })
}
```

- [ ] **Step 2: `src/lib/actions/products.ts`**

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import type { Business } from '@prisma/client'

const productSchema = z.object({
  name: z.string().trim().min(1, 'Ürün adı zorunludur.').max(120, 'Ürün adı çok uzun.'),
  code: z.string().trim().max(20, 'Ürün kodu çok uzun.').optional().or(z.literal('')),
  price: z.coerce.number({ message: 'Fiyat sayı olmalıdır.' }).positive('Fiyat 0\'dan büyük olmalıdır.'),
  calories: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().nonnegative().optional()
  ),
  shortDescription: z.string().trim().max(160, 'Kısa açıklama çok uzun.').optional().or(z.literal('')),
  longDescription: z.string().trim().max(1000, 'Uzun açıklama çok uzun.').optional().or(z.literal('')),
  allergens: z.string().trim().max(300, 'Alerjen bilgisi çok uzun.').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Kategori seçilmelidir.'),
  imageUrl: z.string().trim().optional().or(z.literal('')),
})

function pathsFor(business: Business) {
  return business === 'RESTAURANT'
    ? ['/admin/restaurant/urunler', '/admin/restaurant']
    : ['/admin/bufe/urunler', '/admin/bufe']
}

export async function createProduct(business: Business, formData: FormData): Promise<{ error?: string }> {
  const parsed = productSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } })
  if (!category || category.business !== business) {
    return { error: 'Kategori bu işletmeye ait değil.' }
  }

  const maxSort = await db.product.aggregate({
    where: { categoryId: parsed.data.categoryId },
    _max: { sortOrder: true },
  })

  await db.product.create({
    data: {
      business,
      name: parsed.data.name,
      code: parsed.data.code || null,
      price: parsed.data.price,
      calories: parsed.data.calories ?? null,
      shortDescription: parsed.data.shortDescription || null,
      longDescription: parsed.data.longDescription || null,
      allergens: parsed.data.allergens || null,
      imageUrl: parsed.data.imageUrl || null,
      categoryId: parsed.data.categoryId,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  })

  for (const path of pathsFor(business)) revalidatePath(path)
  return {}
}

export async function updateProduct(id: string, formData: FormData): Promise<{ error?: string }> {
  const parsed = productSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return { error: 'Ürün bulunamadı.' }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } })
  if (!category || category.business !== existing.business) {
    return { error: 'Kategori bu işletmeye ait değil.' }
  }

  await db.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      code: parsed.data.code || null,
      price: parsed.data.price,
      calories: parsed.data.calories ?? null,
      shortDescription: parsed.data.shortDescription || null,
      longDescription: parsed.data.longDescription || null,
      allergens: parsed.data.allergens || null,
      imageUrl: parsed.data.imageUrl || null,
      categoryId: parsed.data.categoryId,
    },
  })

  for (const path of pathsFor(existing.business)) revalidatePath(path)
  return {}
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return { error: 'Ürün bulunamadı.' }

  await db.product.delete({ where: { id } })
  for (const path of pathsFor(existing.business)) revalidatePath(path)
  return {}
}

export async function toggleProductField(
  id: string,
  field: 'isSoldOut' | 'isDailyMenu' | 'isActive',
  value: boolean
): Promise<{ error?: string }> {
  const existing = await db.product.update({ where: { id }, data: { [field]: value } })
  for (const path of pathsFor(existing.business)) revalidatePath(path)
  return {}
}
```

- [ ] **Step 3: `src/lib/actions/upload.ts`**

```ts
'use server'
import { put } from '@vercel/blob'
import sharp from 'sharp'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { error: 'Dosya bulunamadı.' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Yalnızca JPEG, PNG veya WEBP dosyaları desteklenir.' }
  }
  if (file.size > MAX_SIZE) {
    return { error: 'Dosya boyutu 5 MB\'ı geçemez.' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const resized = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const blob = await put(filename, resized, { access: 'public', contentType: 'image/webp' })

  return { url: blob.url }
}
```

- [ ] **Step 4: Install `@vercel/blob` and `sharp`**

```bash
npm install @vercel/blob sharp
```

- [ ] **Step 5: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/products.ts src/lib/actions/products.ts src/lib/actions/upload.ts package.json package-lock.json
git commit -m "feat: urun sorgu/mutasyon katmani ve gorsel yukleme"
```

---

### Task 12: Ürünler listesi sayfası (arama + kategori filtre + hızlı işlemler)

**Files:**
- Create: `src/components/admin/ProductsPage.tsx`
- Create: `src/app/admin/(panel)/restaurant/urunler/page.tsx`
- Create: `src/app/admin/(panel)/bufe/urunler/page.tsx`

**Interfaces:**
- Consumes: `getProducts`, `getCategories`, `deleteProduct`, `toggleProductField` (Task 9, 11), `ConfirmDialog`, `Toggle` (Task 8), `formatPrice` (mevcut `src/lib/utils.ts`).
- Produces: `<ProductsPage business initialProducts initialCategories />`.

- [ ] **Step 1: `src/components/admin/ProductsPage.tsx`**

```tsx
'use client'
import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from './ConfirmDialog'
import Toggle from './Toggle'
import { deleteProduct, toggleProductField } from '@/lib/actions/products'
import { formatPrice } from '@/lib/utils'
import type { ProductWithCategory } from '@/lib/queries/products'
import type { CategoryWithCount } from '@/lib/queries/categories'
import type { Business } from '@prisma/client'

export default function ProductsPage({
  business,
  initialProducts,
  initialCategories,
}: {
  business: Business
  initialProducts: ProductWithCategory[]
  initialCategories: CategoryWithCount[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deletingProduct, setDeletingProduct] = useState<ProductWithCategory | null>(null)
  const [, startTransition] = useTransition()

  const basePath = business === 'RESTAURANT' ? '/admin/restaurant' : '/admin/bufe'

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  function handleDelete() {
    if (!deletingProduct) return
    startTransition(async () => {
      const result = await deleteProduct(deletingProduct.id)
      if (result.error) {
        toast.error(result.error)
        setDeletingProduct(null)
        return
      }
      toast.success('Ürün silindi.')
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
      setDeletingProduct(null)
    })
  }

  function handleToggle(product: ProductWithCategory, field: 'isSoldOut' | 'isDailyMenu', next: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: next } : p)))
    startTransition(async () => {
      const result = await toggleProductField(product.id, field, next)
      if (result.error) {
        toast.error(result.error)
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: !next } : p)))
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Ürünler</h1>
          <p className="mt-1 text-sm text-ink-soft">Fiyat, stok ve günün menüsü durumunu yönetin.</p>
        </div>
        <Link
          href={`${basePath}/urunler/yeni`}
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ürün Ekle
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün ara..."
            className="min-h-[44px] w-full rounded-lg border border-line pl-10 pr-3 text-[15px]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="min-h-[44px] rounded-lg border border-line px-3 text-[15px] sm:w-56"
        >
          <option value="">Tüm Kategoriler</option>
          {initialCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Tükendi</th>
              <th className="px-4 py-3">Günün Menüsü</th>
              <th className="px-4 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">{product.name}</td>
                <td className="px-4 py-3 text-ink-soft">{product.category.name}</td>
                <td className="px-4 py-3 text-ink-soft">{formatPrice(Number(product.price))}</td>
                <td className="px-4 py-3">
                  <Toggle
                    checked={product.isSoldOut}
                    onChange={(next) => handleToggle(product, 'isSoldOut', next)}
                    label={`${product.name} tükendi durumu`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Toggle
                    checked={product.isDailyMenu}
                    onChange={(next) => handleToggle(product, 'isDailyMenu', next)}
                    label={`${product.name} günün menüsü durumu`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`${basePath}/urunler/${product.id}`}
                      aria-label={`${product.name} düzenle`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={() => setDeletingProduct(product)}
                      aria-label={`${product.name} sil`}
                      className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Sonuç bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deletingProduct !== null}
        title="Ürünü Sil"
        description={`"${deletingProduct?.name}" silinecek. Emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: `src/app/admin/(panel)/restaurant/urunler/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/categories'
import ProductsPage from '@/components/admin/ProductsPage'

export const metadata: Metadata = { title: 'Restaurant Ürünleri | Egem Restaurant Menü Yönetim' }

export default async function RestaurantProductsPage() {
  const [products, categories] = await Promise.all([getProducts('RESTAURANT'), getCategories('RESTAURANT')])
  return <ProductsPage business="RESTAURANT" initialProducts={products} initialCategories={categories} />
}
```

- [ ] **Step 3: `src/app/admin/(panel)/bufe/urunler/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/categories'
import ProductsPage from '@/components/admin/ProductsPage'

export const metadata: Metadata = { title: 'Büfe Ürünleri | Egem Restaurant Menü Yönetim' }

export default async function BufeProductsPage() {
  const [products, categories] = await Promise.all([getProducts('BUFE'), getCategories('BUFE')])
  return <ProductsPage business="BUFE" initialProducts={products} initialCategories={categories} />
}
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ProductsPage.tsx "src/app/admin/(panel)/restaurant/urunler/page.tsx" "src/app/admin/(panel)/bufe/urunler/page.tsx"
git commit -m "feat: Urunler listesi sayfasi (arama + filtre + hizli islemler)"
```

---

### Task 13: Ürün ekle/düzenle formu

**Files:**
- Create: `src/components/admin/ProductForm.tsx`
- Create: `src/app/admin/(panel)/restaurant/urunler/yeni/page.tsx`
- Create: `src/app/admin/(panel)/restaurant/urunler/[id]/page.tsx`
- Create: `src/app/admin/(panel)/bufe/urunler/yeni/page.tsx`
- Create: `src/app/admin/(panel)/bufe/urunler/[id]/page.tsx`

**Interfaces:**
- Consumes: `createProduct`, `updateProduct` (Task 11), `uploadProductImage` (Task 11), `getCategories` (Task 9), `getProductById` (Task 11), `SmartImage` (mevcut, önizleme için opsiyonel — burada düz `<img>` kullanılır çünkü yüklenen görsel harici bir Blob URL'idir, statik slot sistemine ait değildir).
- Produces: `<ProductForm business categories product? />` — hem yeni ekleme hem düzenleme için ortak form.

- [ ] **Step 1: `src/components/admin/ProductForm.tsx`**

```tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { uploadProductImage } from '@/lib/actions/upload'
import type { CategoryWithCount } from '@/lib/queries/categories'
import type { ProductWithCategory } from '@/lib/queries/products'
import type { Business } from '@prisma/client'

export default function ProductForm({
  business,
  categories,
  product,
}: {
  business: Business
  categories: CategoryWithCount[]
  product?: ProductWithCategory
}) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  const basePath = business === 'RESTAURANT' ? '/admin/restaurant' : '/admin/bufe'

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadProductImage(formData)
    setUploading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setImageUrl(result.url ?? '')
  }

  function handleSubmit(formData: FormData) {
    formData.set('imageUrl', imageUrl)
    startTransition(async () => {
      const result = product ? await updateProduct(product.id, formData) : await createProduct(business, formData)
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success(product ? 'Ürün güncellendi.' : 'Ürün eklendi.')
      router.push(`${basePath}/urunler`)
    })
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-ink">Temel Bilgiler</h2>

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            Ürün Adı
          </label>
          <input
            id="name"
            name="name"
            defaultValue={product?.name ?? ''}
            required
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-ink">
              Fiyat (₺)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product ? Number(product.price) : ''}
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink">
              Ürün Kodu (opsiyonel)
            </label>
            <input
              id="code"
              name="code"
              defaultValue={product?.code ?? ''}
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-ink">
              Kategori
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? categories[0]?.id ?? ''}
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="calories" className="mb-1 block text-sm font-medium text-ink">
              Kalori (opsiyonel)
            </label>
            <input
              id="calories"
              name="calories"
              type="number"
              min="0"
              defaultValue={product?.calories ?? ''}
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="shortDescription" className="mb-1 block text-sm font-medium text-ink">
            Kısa Açıklama
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            defaultValue={product?.shortDescription ?? ''}
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        <div>
          <label htmlFor="longDescription" className="mb-1 block text-sm font-medium text-ink">
            Uzun Açıklama
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            rows={4}
            defaultValue={product?.longDescription ?? ''}
            className="w-full rounded-lg border border-line px-3 py-2 text-[15px]"
          />
        </div>

        <div>
          <label htmlFor="allergens" className="mb-1 block text-sm font-medium text-ink">
            Alerjen Bilgisi
          </label>
          <input
            id="allergens"
            name="allergens"
            defaultValue={product?.allergens ?? ''}
            placeholder="Örn: Gluten, Süt ürünleri"
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending || uploading}
            className="min-h-[44px] rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white disabled:opacity-60"
          >
            {product ? 'Güncelle' : 'Ürünü Ekle'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Görsel</h2>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Ürün görseli" className="aspect-square w-full rounded-lg object-cover" />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-brand-50 text-sm text-ink-soft">
            Görsel yok
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={uploading}
          aria-label="Ürün görseli yükle"
          className="text-sm"
        />
        {uploading && <p className="text-xs text-ink-soft">Yükleniyor...</p>}
      </div>
    </form>
  )
}
```

- [ ] **Step 2: `src/app/admin/(panel)/restaurant/urunler/yeni/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Yeni Ürün | Egem Restaurant Menü Yönetim' }

export default async function NewRestaurantProductPage() {
  const categories = await getCategories('RESTAURANT')
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Yeni Ürün Ekle</h1>
      <div className="mt-6">
        <ProductForm business="RESTAURANT" categories={categories} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: `src/app/admin/(panel)/restaurant/urunler/[id]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories } from '@/lib/queries/categories'
import { getProductById } from '@/lib/queries/products'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Ürünü Düzenle | Egem Restaurant Menü Yönetim' }

export default async function EditRestaurantProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [categories, product] = await Promise.all([getCategories('RESTAURANT'), getProductById(id)])
  if (!product || product.business !== 'RESTAURANT') notFound()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Ürünü Düzenle</h1>
      <div className="mt-6">
        <ProductForm business="RESTAURANT" categories={categories} product={product} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `src/app/admin/(panel)/bufe/urunler/yeni/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getCategories } from '@/lib/queries/categories'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Yeni Ürün | Egem Büfe Menü Yönetim' }

export default async function NewBufeProductPage() {
  const categories = await getCategories('BUFE')
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Yeni Ürün Ekle</h1>
      <div className="mt-6">
        <ProductForm business="BUFE" categories={categories} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `src/app/admin/(panel)/bufe/urunler/[id]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories } from '@/lib/queries/categories'
import { getProductById } from '@/lib/queries/products'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Ürünü Düzenle | Egem Büfe Menü Yönetim' }

export default async function EditBufeProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [categories, product] = await Promise.all([getCategories('BUFE'), getProductById(id)])
  if (!product || product.business !== 'BUFE') notFound()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Ürünü Düzenle</h1>
      <div className="mt-6">
        <ProductForm business="BUFE" categories={categories} product={product} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 7: Manuel doğrulama**

`DATABASE_URL` ve `BLOB_READ_WRITE_TOKEN` gerçekse: yeni ürün ekle, görsel yükle, kaydet, listede gör; düzenle, görseli değiştir; sil.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/ProductForm.tsx "src/app/admin/(panel)/restaurant/urunler" "src/app/admin/(panel)/bufe/urunler"
git commit -m "feat: urun ekle/duzenle formu"
```

---

### Task 14: Günün Menüsü sayfası

**Files:**
- Create: `src/components/admin/DailyMenuPage.tsx`
- Create: `src/app/admin/(panel)/restaurant/gunun-menusu/page.tsx`
- Create: `src/app/admin/(panel)/bufe/gunun-menusu/page.tsx`

**Interfaces:**
- Consumes: `getProducts` (Task 11), `toggleProductField` (Task 11), `Toggle` (Task 8).
- Produces: `<DailyMenuPage business initialProducts />`.

- [ ] **Step 1: `src/components/admin/DailyMenuPage.tsx`**

```tsx
'use client'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import Toggle from './Toggle'
import { toggleProductField } from '@/lib/actions/products'
import { formatPrice } from '@/lib/utils'
import type { ProductWithCategory } from '@/lib/queries/products'
import type { Business } from '@prisma/client'

export default function DailyMenuPage({
  business,
  initialProducts,
}: {
  business: Business
  initialProducts: ProductWithCategory[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [, startTransition] = useTransition()

  const selectedCount = useMemo(() => products.filter((p) => p.isDailyMenu).length, [products])

  const grouped = useMemo(() => {
    const map = new Map<string, { categoryName: string; items: ProductWithCategory[] }>()
    for (const product of products) {
      const key = product.categoryId
      if (!map.has(key)) map.set(key, { categoryName: product.category.name, items: [] })
      map.get(key)!.items.push(product)
    }
    return Array.from(map.values())
  }, [products])

  function handleToggle(product: ProductWithCategory, next: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isDailyMenu: next } : p)))
    startTransition(async () => {
      const result = await toggleProductField(product.id, 'isDailyMenu', next)
      if (result.error) {
        toast.error(result.error)
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isDailyMenu: !next } : p)))
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Günün Menüsü</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {business === 'BUFE'
              ? 'Bu seçim şu an canlı sitede gösterilmiyor, ileride kullanılmak üzere hazırda tutulur.'
              : 'Seçilen ürünler ana sayfadaki "Günün Menüsü" bölümünde gösterilir.'}
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
          {selectedCount} ürün seçili
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {grouped.map((group) => (
          <div key={group.categoryName} className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-display text-base font-bold text-ink">{group.categoryName}</h2>
            <div className="flex flex-col divide-y divide-line">
              {group.items.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{product.name}</p>
                    <p className="text-xs text-ink-soft">{formatPrice(Number(product.price))}</p>
                  </div>
                  <Toggle
                    checked={product.isDailyMenu}
                    onChange={(next) => handleToggle(product, next)}
                    label={`${product.name} günün menüsünde`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <p className="py-10 text-center text-ink-soft">Henüz ürün eklenmemiş.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `src/app/admin/(panel)/restaurant/gunun-menusu/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import DailyMenuPage from '@/components/admin/DailyMenuPage'

export const metadata: Metadata = { title: 'Günün Menüsü | Egem Restaurant Menü Yönetim' }

export default async function RestaurantDailyMenuPage() {
  const products = await getProducts('RESTAURANT')
  return <DailyMenuPage business="RESTAURANT" initialProducts={products} />
}
```

- [ ] **Step 3: `src/app/admin/(panel)/bufe/gunun-menusu/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import DailyMenuPage from '@/components/admin/DailyMenuPage'

export const metadata: Metadata = { title: 'Günün Menüsü | Egem Büfe Menü Yönetim' }

export default async function BufeDailyMenuPage() {
  const products = await getProducts('BUFE')
  return <DailyMenuPage business="BUFE" initialProducts={products} />
}
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/DailyMenuPage.tsx "src/app/admin/(panel)/restaurant/gunun-menusu" "src/app/admin/(panel)/bufe/gunun-menusu"
git commit -m "feat: Gunun Menusu sayfasi (Restaurant + Bufe)"
```

---

## Faz 4 — Ayarlar ve Teslimat

### Task 15: Ayarlar sayfası (işletme bilgileri + çalışma saatleri)

**Files:**
- Create: `src/lib/queries/settings.ts`
- Create: `src/lib/actions/settings.ts`
- Create: `src/components/admin/HoursEditor.tsx`
- Create: `src/app/admin/(panel)/settings/page.tsx`

**Interfaces:**
- Consumes: `db`, `Business` (Task 1).
- Produces: `getSettings(): Promise<Settings & { hours: DayHours[] }>`, action `updateSettings(formData: FormData): Promise<{ error?: string }>`. `<HoursEditor business hours />` — 7 satırlık form parçası, `Settings` sayfasının içine gömülü (ayrı submit'i yok, ana forma dahil).

- [ ] **Step 1: `src/lib/queries/settings.ts`**

```ts
import { db } from '@/lib/db'
import type { Settings, DayHours } from '@prisma/client'

export type SettingsWithHours = Settings & { hours: DayHours[] }

export async function getSettings(): Promise<SettingsWithHours> {
  const settings = await db.settings.findUnique({
    where: { id: 'singleton' },
    include: { hours: { orderBy: [{ business: 'asc' }, { weekday: 'asc' }] } },
  })
  if (!settings) {
    throw new Error('Ayarlar bulunamadı. Seed script çalıştırıldığından emin olun.')
  }
  return settings
}
```

- [ ] **Step 2: `src/lib/actions/settings.ts`**

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'

const settingsSchema = z.object({
  brandName: z.string().trim().min(1, 'Marka adı zorunludur.'),
  tagline: z.string().trim().optional().or(z.literal('')),
  aboutText: z.string().trim().optional().or(z.literal('')),
  restaurantName: z.string().trim().min(1, 'Restaurant adı zorunludur.'),
  restaurantPhone: z.string().trim().optional().or(z.literal('')),
  restaurantWhatsapp: z.string().trim().optional().or(z.literal('')),
  bufeName: z.string().trim().min(1, 'Büfe adı zorunludur.'),
  bufePhone: z.string().trim().optional().or(z.literal('')),
  bufeWhatsapp: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  mapEmbedUrl: z.string().trim().optional().or(z.literal('')),
  directionsUrl: z.string().trim().optional().or(z.literal('')),
  instagram: z.string().trim().optional().or(z.literal('')),
  facebook: z.string().trim().optional().or(z.literal('')),
  youtube: z.string().trim().optional().or(z.literal('')),
  showPrices: z.coerce.boolean(),
  themeColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Geçerli bir renk kodu girin.'),
})

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const
const BUSINESSES = ['RESTAURANT', 'BUFE'] as const

export async function updateSettings(formData: FormData): Promise<{ error?: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = settingsSchema.safeParse({ ...raw, showPrices: raw.showPrices === 'on' })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  await db.settings.update({ where: { id: 'singleton' }, data: parsed.data })

  const hourUpdates: Promise<unknown>[] = []
  for (const business of BUSINESSES) {
    for (const weekday of WEEKDAYS) {
      const prefix = `hours.${business}.${weekday}`
      const isClosed = formData.get(`${prefix}.isClosed`) === 'on'
      const openTime = formData.get(`${prefix}.openTime`)
      const closeTime = formData.get(`${prefix}.closeTime`)

      hourUpdates.push(
        db.dayHours.updateMany({
          where: { settingsId: 'singleton', business, weekday },
          data: {
            isClosed,
            openTime: isClosed ? null : typeof openTime === 'string' && openTime ? openTime : null,
            closeTime: isClosed ? null : typeof closeTime === 'string' && closeTime ? closeTime : null,
          },
        })
      )
    }
  }
  await Promise.all(hourUpdates)

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return {}
}
```

- [ ] **Step 3: `src/components/admin/HoursEditor.tsx`**

```tsx
'use client'
import Toggle from './Toggle'
import type { DayHours, Business } from '@prisma/client'

const WEEKDAY_LABELS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

export default function HoursEditor({ business, hours }: { business: Business; hours: DayHours[] }) {
  const rows = [...hours].sort((a, b) => a.weekday - b.weekday)

  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((row) => (
        <HoursRow key={row.weekday} business={business} row={row} label={WEEKDAY_LABELS[row.weekday]} />
      ))}
    </div>
  )
}

function HoursRow({ business, row, label }: { business: Business; row: DayHours; label: string }) {
  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="w-28 text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <ClosedToggle name={`hours.${business}.${row.weekday}.isClosed`} defaultChecked={row.isClosed} />
        <input
          type="time"
          name={`hours.${business}.${row.weekday}.openTime`}
          defaultValue={row.openTime ?? ''}
          className="min-h-[44px] rounded-lg border border-line px-3 text-[15px]"
        />
        <span className="text-ink-soft">–</span>
        <input
          type="time"
          name={`hours.${business}.${row.weekday}.closeTime`}
          defaultValue={row.closeTime ?? ''}
          className="min-h-[44px] rounded-lg border border-line px-3 text-[15px]"
        />
      </div>
    </div>
  )
}

function ClosedToggle({ name, defaultChecked }: { name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-xs text-ink-soft">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      Kapalı
    </label>
  )
}
```

- [ ] **Step 4: `src/app/admin/(panel)/settings/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getSettings } from '@/lib/queries/settings'
import SettingsForm from '@/components/admin/SettingsForm'

export const metadata: Metadata = { title: 'Ayarlar | Egem Restaurant Menü Yönetim' }

export default async function SettingsPage() {
  const settings = await getSettings()
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Ayarlar</h1>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `src/components/admin/SettingsForm.tsx`**

```tsx
'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { updateSettings } from '@/lib/actions/settings'
import HoursEditor from './HoursEditor'
import type { SettingsWithHours } from '@/lib/queries/settings'

export default function SettingsForm({ settings }: { settings: SettingsWithHours }) {
  const [isPending, startTransition] = useTransition()
  const restaurantHours = settings.hours.filter((h) => h.business === 'RESTAURANT')
  const bufeHours = settings.hours.filter((h) => h.business === 'BUFE')

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Ayarlar kaydedildi.')
    })
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Genel</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Marka Adı" name="brandName" defaultValue={settings.brandName} />
          <Field label="Slogan" name="tagline" defaultValue={settings.tagline ?? ''} />
        </div>
        <div className="mt-4">
          <label htmlFor="aboutText" className="mb-1 block text-sm font-medium text-ink">
            Hakkımızda Metni
          </label>
          <textarea
            id="aboutText"
            name="aboutText"
            rows={3}
            defaultValue={settings.aboutText ?? ''}
            className="w-full rounded-lg border border-line px-3 py-2 text-[15px]"
          />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">İletişim</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Restaurant Adı" name="restaurantName" defaultValue={settings.restaurantName} />
          <Field label="Restaurant Telefon" name="restaurantPhone" defaultValue={settings.restaurantPhone ?? ''} />
          <Field label="Restaurant WhatsApp" name="restaurantWhatsapp" defaultValue={settings.restaurantWhatsapp ?? ''} />
          <Field label="Büfe Adı" name="bufeName" defaultValue={settings.bufeName} />
          <Field label="Büfe Telefon" name="bufePhone" defaultValue={settings.bufePhone ?? ''} />
          <Field label="Büfe WhatsApp" name="bufeWhatsapp" defaultValue={settings.bufeWhatsapp ?? ''} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="Adres" name="address" defaultValue={settings.address ?? ''} />
          <Field label="Harita Embed URL" name="mapEmbedUrl" defaultValue={settings.mapEmbedUrl ?? ''} />
          <Field label="Yol Tarifi URL" name="directionsUrl" defaultValue={settings.directionsUrl ?? ''} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Instagram" name="instagram" defaultValue={settings.instagram ?? ''} />
          <Field label="Facebook" name="facebook" defaultValue={settings.facebook ?? ''} />
          <Field label="YouTube" name="youtube" defaultValue={settings.youtube ?? ''} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Çalışma Saatleri — Restaurant</h2>
        <div className="mt-4">
          <HoursEditor business="RESTAURANT" hours={restaurantHours} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Çalışma Saatleri — Büfe</h2>
        <div className="mt-4">
          <HoursEditor business="BUFE" hours={bufeHours} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Görünüm</h2>
        <div className="mt-4 flex items-center gap-3">
          <input type="checkbox" id="showPrices" name="showPrices" defaultChecked={settings.showPrices} className="h-5 w-5" />
          <label htmlFor="showPrices" className="text-sm text-ink">
            Fiyatları canlı sitede göster
          </label>
        </div>
        <div className="mt-4 max-w-xs">
          <label htmlFor="themeColor" className="mb-1 block text-sm font-medium text-ink">
            Tema Rengi (yalnızca admin paneli arabirimini etkiler)
          </label>
          <input
            id="themeColor"
            name="themeColor"
            type="color"
            defaultValue={settings.themeColor}
            className="h-11 w-20 rounded-lg border border-line"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[44px] w-full rounded-lg bg-brand-500 text-sm font-semibold text-white disabled:opacity-60 sm:w-64"
      >
        Ayarları Kaydet
      </button>
    </form>
  )
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
      />
    </div>
  )
}
```

- [ ] **Step 6: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: Hatasız.

- [ ] **Step 7: Manuel doğrulama**

`DATABASE_URL` gerçekse: `/admin/settings` aç, tüm alanların seed verisiyle dolu geldiğini doğrula, birkaç alanı değiştir, kaydet, sayfayı yenile ve değişikliklerin kalıcı olduğunu doğrula.

- [ ] **Step 8: Commit**

```bash
git add src/lib/queries/settings.ts src/lib/actions/settings.ts src/components/admin/HoursEditor.tsx src/components/admin/SettingsForm.tsx "src/app/admin/(panel)/settings"
git commit -m "feat: Ayarlar sayfasi (isletme bilgileri + calisma saatleri)"
```

---

### Task 16: README güncellemesi ve Plan A final doğrulaması

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: Nothing new — bu görev sadece dokümantasyon ve tam-proje doğrulamasıdır.

- [ ] **Step 1: `README.md`'ye "Admin Paneli Kurulumu" bölümü ekle**

Mevcut README'nin sonuna (veya "Kurulum" bölümünden hemen sonra) şu bölümü ekle:

```markdown
## Admin Paneli Kurulumu

Restaurant ve Büfe menülerini, günün menüsünü ve işletme ayarlarını yönetmek için `/admin` altında bir yönetim paneli bulunur.

### 1. Veritabanı (Neon)

1. [neon.tech](https://neon.tech) üzerinde ücretsiz bir hesap açın ve yeni bir proje oluşturun.
2. Proje panelinden "Connection string" değerini kopyalayın (`postgresql://...` ile başlar).
3. `.env.example` dosyasını `.env` olarak kopyalayın ve `DATABASE_URL` değerine yapıştırın.

### 2. Ortam değişkenleri

`.env` dosyasında şu değerleri doldurun:

- `DATABASE_URL` — Neon connection string
- `AUTH_SECRET` — `npx auth secret` komutuyla üretilebilir
- `NEXTAUTH_URL` — geliştirmede `http://localhost:3000`, production'da gerçek domain
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token (aşağıda)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — ilk admin kullanıcısının giriş bilgileri (yalnızca `prisma db seed` çalıştırılırken kullanılır)

### 3. Şema ve seed verisi

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Bu komutlar veritabanı şemasını oluşturur ve mevcut menü verisini (Restaurant + Büfe kategorileri/ürünleri), varsayılan işletme ayarlarını ve `ADMIN_EMAIL`/`ADMIN_PASSWORD` ile bir admin kullanıcısı ekler.

### 4. Vercel Blob (görsel yükleme)

1. Vercel projenizin Storage sekmesinden bir Blob store oluşturun.
2. Üretilen `BLOB_READ_WRITE_TOKEN` değerini `.env`'e (ve Vercel proje ayarlarındaki Environment Variables'a) ekleyin.

### 5. Girişi test edin

```bash
npm run dev
```

`http://localhost:3000/admin/login` adresine gidin, `.env`'deki `ADMIN_EMAIL`/`ADMIN_PASSWORD` ile giriş yapın.

### 6. Vercel'e deploy

Vercel proje ayarlarında şu environment variable'ları tanımlayın: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (production domain), `BLOB_READ_WRITE_TOKEN`. Deploy sonrası, gerekiyorsa `npx prisma migrate deploy` production veritabanına karşı çalıştırılır.
```

- [ ] **Step 2: Tam proje doğrulaması**

Run: `npx tsc --noEmit`
Expected: Hatasız.

Run: `npm run lint`
Expected: Hatasız.

Run: `npx vitest run`
Expected: Tüm testler PASS (mevcut testler + Task 4 rate-limit + Task 9 slug testleri).

Run: `npm run build`
Expected: Başarılı build, hata yok.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: admin paneli kurulum rehberi"
```

---
