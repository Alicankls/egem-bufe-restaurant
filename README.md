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

### 6. Admin şifresini sıfırlama

Admin kullanıcısının şifresini unuttuysanız veya değiştirmek isterseniz:

```bash
npm run admin:reset -- admin@egemtrak.com yeni-guclu-sifre
```

Bu komut mevcut kullanıcıyı günceller veya (e-posta kayıtlı değilse) yeni
bir admin kullanıcısı oluşturur. `prisma/seed.ts`'in aksine, bu script'i
istediğiniz zaman tekrar çalıştırabilirsiniz — yalnızca belirttiğiniz
kullanıcıyı etkiler.

### 7. Vercel'e deploy

Vercel proje ayarlarında şu environment variable'ları tanımlayın: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (production domain), `BLOB_READ_WRITE_TOKEN`. Deploy sonrası, gerekiyorsa `npx prisma migrate deploy` production veritabanına karşı çalıştırılır.

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
