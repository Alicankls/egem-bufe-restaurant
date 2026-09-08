# EGEM Admin Paneli — Tasarım Spec'i

**Tarih:** 2026-09-08
**Durum:** Onay bekliyor

## 1. Amaç

Restaurant ve Büfe menülerini (kategori/ürün/fiyat/günün menüsü) ve işletme ayarlarını (telefon, adres, saat, sosyal medya) yöneten, Türkçe, `/admin` altında yaşayan bir yönetim paneli. Değişiklikler canlı siteye (`/`, `/menu`, `/restaurant`, `/bufe`) anında yansır.

## 2. Kapsam

**DB-driven (admin panelden yönetilir):**
- Restaurant ve Büfe menüleri (kategori, ürün, fiyat, günün menüsü — her ikisi için de yönetim sayfası var; Büfe'nin günün menüsü seçimi şimdilik canlı sitede gösterilmez, veritabanında hazır durur)
- İşletme ayarları: iki işletmenin ayrı telefon/WhatsApp'ı, paylaşılan adres/harita/yol tarifi, sosyal medya, `showPrices` bayrağı, haftalık çalışma saatleri (her işletme × her gün)

**Kapsam dışı (statik kalır, `images.ts`/`site.ts` sistemiyle devam eder):**
- Pazarlama görselleri (Hero, Galeri, Mozaik banner'lar vb.)
- Marka renkleri / `tailwind.config.ts` token'ları — Ayarlar'daki "Tema Rengi" yalnızca admin panelinin kendi arabirimini etkiler, canlı siteyi etkilemez

## 3. Teknoloji

- Next.js 16 (App Router) + TypeScript strict — mevcut projeyle aynı
- Tailwind CSS **v3** (proje zaten sabit) — pasted prompt'un v4 varsayımı yok sayılır
- Prisma ORM + PostgreSQL (**Neon**)
- Auth.js v5 (NextAuth) — Credentials provider, `bcryptjs` ile şifre hash'i. **Next.js 16 ile uyumu implementasyonun ilk adımında doğrulanacak**; sorun çıkarsa en yakın uyumlu sürüme sabitlenir ve bu bir ruling olarak loglanır (ilk site kurulumundaki Tailwind v4→v3 sabitlemesiyle aynı desen).
- Server Actions (mutasyonlar için, ayrı API route açılmaz)
- Zod doğrulama (client + server), lucide-react ikonlar, sonner toast
- Görsel yükleme: **Vercel Blob**
- `.env.example`: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

## 4. Veri Modeli (Prisma)

```prisma
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
  weekday    Int      // 0=Pazartesi..6=Pazar (src/lib/hours.ts sıralamasıyla eşleşir)
  isClosed   Boolean  @default(false)
  openTime   String?  // "08:00"
  closeTime  String?  // "21:00"

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

`prisma/seed.ts`: 1 admin kullanıcı (env'den), Settings singleton + 14 `DayHours` satırı (2 işletme × 7 gün, mevcut `site.ts`'teki saatlerle aynı), Restaurant için 8 kategori/~50 ürün, Büfe için 6 kategori/~29 ürün — mevcut `src/data/menu.ts`/`bufe.ts` içeriği taşınarak.

## 5. Auth ve Güvenlik

Pasted prompt'un 3. bölümündeki tüm spesifikasyon (login sayfası tasarımı, `middleware.ts` koruması, callbackUrl, JWT+httpOnly cookie 30 gün, çıkış akışı, rate limit) **aynen** geçerli — tek fark:

- Login kartı rengi: near-black + bordo yerine **`brand-950` zemin + `brand-500` vurgu**.
- Logo kutusu: `SmartImage` slot sistemiyle (`brand.logoLight`), placeholder her zaman profesyonel görünür.
- Font: Plus Jakarta Sans (`font-display`) + Inter.

## 6. Genel Layout ve Tasarım Dili

Pasted prompt'un 4. bölümündeki sidebar/içerik alanı spesifikasyonu aynen geçerli, renk/font eşlemesi:

| Pasted prompt | EGEM karşılığı |
|---|---|
| near-black sidebar | `brand-950` |
| bordo/kırmızı marka rengi (aktif öğe, birincil buton, toggle açık) | `brand-500` |
| krem/açık bej sayfa zemini (`#FAF7F2`) | `brand-50` |
| Playfair Display başlık | `font-display` (Plus Jakarta Sans) |
| Inter gövde | Inter (zaten aynı) |

Sidebar menüsü, "iki tamamen ayrı bölüm" kararına göre genişler:

- `Dashboard` → `/admin`
- `Restaurant` (alt öğeler: `Kategoriler`, `Ürünler`, `Günün Menüsü`) → `/admin/restaurant/*`
- `Büfe` (alt öğeler: `Kategoriler`, `Ürünler`, `Günün Menüsü`) → `/admin/bufe/*`
- `Ayarlar` → `/admin/settings`

## 7. Sayfalar

Pasted prompt'un 5. bölümündeki (Dashboard, Kategoriler, Ürünler, Ürün Ekle/Düzenle, Günün Menüsü, Ayarlar) tüm ekran spesifikasyonu **aynen** geçerli, şu farklarla:

- Her sayfa iki kez var: `/admin/restaurant/...` ve `/admin/bufe/...` (aynı bileşenler, `business` prop/route param'ıyla parametrize).
- Dashboard 5 istatistik kartı artık **işletme bazlı** gösterilir (Restaurant toplam/aktif/tükendi/günün menüsü/kategori + Büfe için aynısı, iki grup halinde) — pasted prompt'taki tek grup yerine.
- Ayarlar sayfası: pasted prompt'un "İletişim" bölümü Restaurant/Büfe için ayrı telefon/WhatsApp alanlarına bölünür; "Çalışma Saatleri" düz metin yerine gün gün (Pazartesi-Pazar × açık-kapalı toggle + saat) yapılandırılmış bir editöre dönüşür, iki işletme için ayrı ayrı.
- "Tema Rengi" alanı kalır ama yalnızca admin panelinin kendi arabirimini etkilediği açıkça belirtilir (canlı siteyi etkilemez).

## 8. Canlı Site Entegrasyonu

Mevcut public sayfalar artık DB'den okur:

- `src/data/menu.ts`/`bufe.ts`'in yerini Prisma sorguları alır — `MenuContent`, `MenuPreview`, `CategoryGrid`, `PopularStrip`, `Featured` gibi bileşenler artık statik import yerine sunucu tarafında DB'den çekilen veriyle render edilir.
- `TodaysSpecialBlock` artık `isDailyMenu=true` + `business=RESTAURANT` olan ürünleri DB'den çeker (Büfe tarafı şimdilik hiçbir yerde render edilmez).
- `siteConfig`'in ilgili alanları (telefon, WhatsApp, adres, saatler, `showPrices`) `Settings`+`DayHours`'tan okunur; `src/lib/hours.ts`'in mevcut `getOpenStatus`/`getTodayWeekday` mantığı değişmeden, sadece girdisi DB'den gelen veri olacak şekilde kullanılır.
- Admin'de bir kayıt değiştiğinde ilgili public route'lar `revalidatePath` ile temizlenir (Kategoriler/Ürünler → `/`, `/menu`, `/restaurant`, `/bufe`; Ayarlar → `/`, `layout`).
- `siteUrl`, marka sabitleri gibi yalnızca kod seviyesinde anlamlı alanlar `site.ts`'te kalır (DB'ye taşınmaz).

## 9. Kabul Kriterleri

Pasted prompt'un 6. bölümündeki tüm kriterler + ek olarak:

- [ ] Restaurant ve Büfe admin sayfaları birbirinden bağımsız çalışıyor, veri karışmıyor.
- [ ] `/menu`, `/restaurant`, `/bufe`, `/` artık DB'den okuyor; admin'de yapılan bir değişiklik (fiyat, tükendi, günün menüsü, ayarlar) sayfa yenilemeden/yeniden deploy etmeden canlıda görünüyor.
- [ ] Mevcut 48 testin hiçbiri kırılmıyor; DB'ye bağımlı hale gelen bileşenler için yeni testler ekleniyor.
- [ ] `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm test` hatasız.

## 10. Teslimat

`README.md` güncellenir: admin kurulumu (Neon DB oluşturma, `.env` doldurma, `prisma migrate dev`, `prisma db seed`), admin girişi nasıl oluşturulur, Vercel Blob token alma, Vercel'e deploy (env değişkenleri dahil).
