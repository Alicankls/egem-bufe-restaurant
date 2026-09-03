# EGEM-TRAK Restaurant & EGEM Büfe — Tanıtım Web Sitesi + QR Menü — Tasarım Spec'i

**Tarih:** 2026-09-03
**Durum:** Onay bekliyor (kullanıcı onayından sonra writing-plans ile uygulama planına geçilecek)

## 1. Amaç ve Kapsam

Tek marka çatısı (EGEM) altında iki işletmeyi (EGEM-TRAK Restaurant ve EGEM Büfe) tanıtan,
kullanıcıyı doğru bölüme yönlendiren ve masalardaki QR kodun açtığı dijital menüyü sunan
kurumsal bir tanıtım sitesi.

**Kapsam dışı (kesinlikle yok):** sepet, ödeme, üyelik/hesap, sipariş akışı, e-ticaret,
"sepete ekle" aksiyonu, fiyat kartı + satın alma hissi veren hiçbir UI.

## 2. İşletme Bağlamı

- **EGEM-TRAK Restaurant**: günlük tabldot / ev yemeği lokantası. Sıcak, doyurucu, güvenilir ton.
- **EGEM Büfe**: tost/sandviç/sosisli/hamburger gibi hızlı ürünler. Pratik, hızlı ton.
- Konum: Tekirdağ / Çorlu, Yeni Sanayi Bölgesi. Hedef kitle: sanayi bölgesi çalışanları,
  esnaf, TIR/kamyon sürücüleri, çevre halkı.
- Gerçek adres/telefon/WhatsApp/saat/harita koordinatı bilinmiyor → `src/config/site.ts`
  içinde gerçekçi placeholder + `// TODO: müşteriden alınacak` yorumuyla, TEK dosyadan
  yönetilecek şekilde tanımlanacak. Hiçbir yere hard-code edilmeyecek.

## 3. Teknoloji Yığını

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS
- next/font ile Google Fonts (self-hosted, `display: swap`, subset: latin + latin-ext)
- next/image, lucide-react
- `qrcode` paketi — yalnızca `/qr` sayfasında SVG QR üretimi için
- Ek UI/animasyon kütüphanesi YOK (shadcn, MUI, Bootstrap, framer-motion, GSAP, AOS,
  swiper vb. kullanılmayacak). Slider ve yatay kaydırmalar CSS scroll-snap + custom hook.
- Animasyon: yalnızca CSS transition + IntersectionObserver ile hafif fade-up (200ms).
  `prefers-reduced-motion` desteklenecek.
- Dil: Türkçe, `<html lang="tr">`.
- Paket yöneticisi: **npm**.

## 4. Referans Site (yalnızca yapı/iskelet)

`https://fasulyeli.com/` yapısal referans alınır (doğrulandı: bölünmüş/ortalanmış logolu
header, tam ekran hero slider, welcome bloğu, split promo, ürün grid'i, mozaik/tam genişlik
bantlar, yorumlar, footer, mobil alt bar sırası). **Metin, görsel, logo veya menü içeriği
KOPYALANMAYACAK.** WooCommerce/sepet/hesap/istek listesi, ürün-fiyat kartları, blog bölümü,
zeytin yeşili+kahve palet, serif tipografi ALINMAYACAK. Tüm içerik EGEM için özgün yazılacak.

## 5. Bilgi Mimarisi (Sayfalar)

```
/             Anasayfa
/restaurant   EGEM-TRAK Restaurant
/bufe         EGEM Büfe
/menu         QR Menü (masa QR'ının açtığı sayfa)
/hakkimizda   Hakkımızda
/iletisim     İletişim
/qr           QR üretme + yazdırma (işletme sahibi için, noindex)
not-found     404
```

## 6. Tasarım Sistemi

### 6.1 Renk (Tailwind theme değişkeni olarak; component içinde hex yazılmayacak)

| Token | Hex | Kullanım |
|---|---|---|
| brand-950 | #072138 | header (sticky), footer, koyu bantlar |
| brand-900 | #0A2540 | |
| brand-700 | #10508C | |
| brand-600 | #1461A8 | |
| brand-500 | #1A73C7 | ana mavi — buton, link, aktif durum |
| brand-200 | #C3DCF2 | |
| brand-100 | #E6F0FA | |
| brand-50  | #F5F9FD | alternatif section zemini |
| accent-500 | #F7B500 | sarı — çok kısıtlı vurgu (toplam görsel alanın %5'i) |
| ink | #14202C | ana metin |
| ink-soft | #5B6B7C | ikincil metin |
| line | #E3E9F0 | ayırıcı çizgiler |
| white | #FFFFFF | baskın zemin |

**Kurallar:** Section zemin ritmi beyaz → brand-50 → beyaz → görselli koyu bant → beyaz
şeklinde ilerler; art arda iki koyu section yok. Sarı vurgu ≤ %5. Gradient yok (istisna:
hero/koyu bant overlay'i, brand-950 %55 opaklık düz katman). Gölge en fazla shadow-sm/md.
Köşe: kart `rounded-xl` (14px), buton `rounded-lg` (10px), görsel `rounded-lg`.

### 6.2 Tipografi

- Başlık: **Plus Jakarta Sans** (600/700/800), `--font-display` CSS değişkeni üzerinden.
- Gövde: **Inter** (400/500). Serif yok.
- Kicker: uppercase, 13px, letter-spacing 0.12em, accent-500.
- Hero H1: 72px → 34px (mobil), weight 800, line-height 1.1.
- Hero alt metin: 22px weight 300, line-height 1.6, beyaz %85 opaklık.
- Section H2: 44px → 26px, line-height 1.2.
- **Karma ağırlıklı başlık:** `<SectionTitle lead="..." strong="..." />` — lead weight 400,
  strong weight 800 (örn. "Öne Çıkan **Lezzetler**").
- Gövde: 17px / line-height 1.65, ink-soft, paragraf max-width 65ch.
- Container max-width 1200px, yatay padding 20px (mobil) / 32px (masaüstü).
- Section dikey padding: 96px masaüstü / 56px mobil.

### 6.3 İki işletmenin görsel ayrımı (aynı font + palet içinde)

- Restaurant: brand-700/900 ağırlıklı, sakin/oturaklı, geniş satır aralığı, tabak/çorba/
  çatal-bıçak ikon dili.
- Büfe: brand-500 ağırlıklı, sarı vurgu biraz daha görünür, kompakt kartlar, kısa cümleler,
  sandviç/kahve/zamanlayıcı ikon dili.

## 7. Header Mimarisi

**Masaüstü (≥1024px):** tek satır, tam genişlik, 3 sütun flex (sol/sağ eşit genişlik, logo
tam ortada):
- Sol: arama ikonu (Search) + ANASAYFA · RESTAURANT · BÜFE
- Orta: logo (`brand.logo` slotu, ~200×52, contain; yoksa metin logo fallback: üstte
  "EGEM-TRAK", altta ince letter-spacing'li "Restaurant & Büfe")
- Sağ: MENÜ · HAKKIMIZDA · İLETİŞİM + telefon ikonu + numara
- Nav tipografisi: uppercase, 13px, weight 600, letter-spacing 0.04em
- Yükseklik ~64px, tam genişlik, yatay padding 32px

**Davranış:**
- Anasayfada header hero üzerinde: şeffaf zemin, beyaz metin/ikon, `brand.logoLight`.
  80px scroll sonrası: brand-950 zemin, beyaz metin, ince gölge, 250ms geçiş.
- Diğer tüm sayfalarda header baştan koyu (brand-950) ve yapışkan (şeffaf mod yok).

**Mobil (<1024px):** sol hamburger, orta logo, sağ telefon ikonu. Hamburger → tam ekran
drawer (koyu lacivert zemin, büyük tıklama alanlı link listesi, altta Ara/WhatsApp/Yol
Tarifi butonları).

**Mobil sabit alt bar** (<1024px, tüm sayfalar): 4 eşit buton — Menü · Ara · WhatsApp ·
Yol Tarifi, ikon + küçük etiket, beyaz zemin, üst kenarlık, `env(safe-area-inset-bottom)`
padding. Sayfa altına bu barın yüksekliği kadar boşluk bırakılır.

Sağ altta "yukarı çık" dairesel buton (mobilde alt barın üstünde konumlanır).

## 8. Anasayfa — Bölüm Dökümü (sıra korunacak)

1. **Hero Slider** — tam genişlik, 100vh (max 900px, mobil 78vh), 2 slayt, 6sn oto geçiş,
   sonsuz döngü, ok butonları, nokta göstergeleri, klavye + dokunmatik destekli (custom
   hook, swiper yok). Her slaytta arka plan + brand-950 %55 overlay + kicker/H1/alt
   metin/CTA'lar. Sol altta canlı açık/kapalı rozeti (client-side, `hours.ts`'den).
2. **Hoşgeldiniz Bloğu** — sol: 2 görsel yan yana hafif kaydırılmış (3/4 ve 4/5 oran,
   ~40px binme; mobilde alt alta, binme yok); sağ: kicker + H2 + 3-4 cümle + ayraç.
3. **Bölünmüş Tanıtım Bandı** (brand-50) — sol: kicker + 3 satır başlık + 2 buton; sağ:
   16/9 video slotu + play ikonu (video yoksa play gizli, modal YouTube embed).
4. **Öne Çıkan Lezzetler** (fiyatsız) — ortalanmış başlık + 3 sütun (mobil 2) × 6 kart,
   kare görsel + isim + kategori. Fiyat/sepet/hover aksiyonu YOK, sadece hover'da hafif
   scale (1.03). Kart → `/menu` ilgili kategoriye gider. Altta "Tüm Menüyü Gör" CTA.
5. **Mozaik Banner Şeridi** — tam genişlik 4 kolon (mobil 2×2), boşluksuz, 420px/240px
   yükseklik, overlay + ortalanmış beyaz metin, hover'da overlay koyulaşır.
6. **Ortalanmış Ara Metin** — dar kolon, kicker + karma başlık + 2-3 satır, görsel yok.
7. **Arka Plan Görselli Tam Genişlik Bölüm** — 520px, sabit görsel + %60 overlay, karma
   başlık + 2 satır + 1 outline buton. Parallax çok hafif/yok; mobilde `background-attachment: scroll`.
8. **Üçlü Görsel/Video Şeridi** — beyaz kart, önceki bölümün üstüne ~60px biner, 3×4/3
   görsel + play ikonu (opsiyonel), mobilde yatay scroll-snap.
9. **İkili Dönüşümlü Tanıtım Blokları** (2 adet) — Blok A (görsel sol, Restaurant içerik),
   Blok B (görsel sağ, ters düzen, Büfe içerik). İki işletmeyi net ayıran ana bölüm.
10. **Müşteri Yorumları** (brand-50) — 3 sütun (mobil 1), 5-6 kart, avatar/isim/5 yıldız
    (accent-500)/tarih/yorum. Placeholder içerik + `// TODO: gerçek Google yorumları`.
    Google logosu/markası kullanılmaz (statik metin yorumları).
11. **Galeri** — ortalanmış başlık + 3 sütun × 6 görsel (4/3), tıklayınca custom lightbox
    (kütüphane yok, ESC + ok tuşu).
12. **Konum ve Saatler** — sol tam yükseklik Maps iframe (lazy, TODO koordinat), sağ:
    adres + iki işletmenin saat tablosu (bugünün satırı vurgulu) + Ara/WhatsApp/Yol Tarifi.
13. **QR Menü Bandı** (brand-900) — sol: başlık + cümle + "Menüyü Aç" CTA; sağ: küçük
    statik SVG QR.
14. **Footer** (brand-950) — üst: logo (beyaz) + marka sözü + tıklanabilir iletişim
    satırları (adres/tel-restaurant/tel-büfe/WhatsApp); alt bar: telif + sosyal ikonlar.

## 9. Alt Sayfalar

**`/restaurant`**: 420px hero (görsel+overlay+başlık+breadcrumb) → tanıtım bloğu (görsel
sol) → "Bugünün Tabldotu" (tarih + sarı rozet) → menü önizleme (kategori başına 4 örnek +
"Tüm Menü" CTA → `/menu?tab=restaurant`) → toplu/paket yemek bilgi kutusu + WhatsApp CTA →
mozaik banner şeridi (bileşen tekrar kullanımı) → galeri (4 görsel) → konum+saat+CTA bandı.

**`/bufe`**: hero (Büfe görselleri) → 3 adımlık şerit (Seç → Hazırlansın → Al git) → ürün
kategorileri grid'i (6 kategori, görsel slotlu kart → `/menu?tab=bufe`) → popüler ürünler
şeridi (yatay scroll-snap, fiyatsız) → "WhatsApp'tan yazın, hazır olsun" kutusu (form değil,
tek büyük WhatsApp butonu) → saat+konum+CTA.

**`/hakkimizda`**: asimetrik üst blok (sol kicker+başlık, sağ 2 kısa metin bloğu) → görsel
sol/metin sağ ("Lokantamız Hakkında") → 4 ikonlu değer maddesi → geniş mekân/ekip görseli
(16/9 tam genişlik) → galeri (6 slot) → CTA bandı.

**`/iletisim`**: üst koyu ince bant + başlık → 2 sütun (ortada dikey ayırıcı): sol SSS
akordiyonu (6 soru, ilk madde açık, aktif başlık brand-500), sağ iletişim formu (İsim/
E-posta yan yana, Telefon/Konu yan yana, Mesaj textarea, GÖNDER) — yalnızca frontend +
client-side validasyon, submit handler `// TODO: form gönderim entegrasyonu`, başarı/hata
UI durumları hazır → altta tam genişlik harita + adres kartı + iki işletmenin telefonları
ayrı ayrı etiketli.

## 10. `/menu` — QR Menü (en kritik sayfa, mobil öncelikli)

- Sadeleştirilmiş header: yalnızca logo + Ara/WhatsApp ikonları (tam nav yok).
- Üstte 2 büyük sekme (RESTAURANT | BÜFE), seçim URL'e yansır (`?tab=restaurant` /
  `?tab=bufe`) — QR kodları doğrudan ilgili sekmeye gidebilir.
- Yapışkan kategori barı: yatay kaydırmalı chip'ler, aktif chip'te accent-500 alt çizgi,
  tıklayınca yumuşak scroll, scroll sırasında IntersectionObserver ile aktif chip
  otomatik güncellenir.
- Kategoriler — Restaurant: Çorbalar · Sulu Yemekler · Izgara & Ana Yemek ·
  Zeytinyağlılar · Pilav & Makarna · Salata & Meze · Tatlılar · İçecekler.
  Büfe: Tostlar · Sandviçler · Sosisli & Hamburger · Kahvaltılık · Atıştırmalık · İçecekler.
- En üstte "Bugünün Tabldotu" bloğu (tarih + o günün yemekleri, sarı rozet).
- Ürün satırı: sol ad (w600) + opsiyonel açıklama satırı (ink-soft), sağ fiyat
  (tabular-nums, hizalı), satırlar arası ince `line` ayırıcı. Kart içinde kart yok.
- Rozetler: Acılı, Vejetaryen, Yeni, Günün Yemeği.
- Karma görsel modu: görseli olan ürün solda 72×72 rounded thumbnail; olmayan görselsiz/
  kompakt satır — aynı listede yan yana tasarım bozulmadan durur.
- Fiyat gösterimi `site.ts` → `showPrices: boolean` bayrağıyla açılıp kapanır.
- Client-side arama (isim+açıklama, debounce'lu).
- Altta alerjen notu, çalışma saatleri, Ara/WhatsApp/Yol Tarifi.
- Performans: statik import menü verisi, minimum JS, yavaş mobilde 2sn açılış hedefi.
- A11y: sekmeler `role="tablist"`, dokunma hedefi min 44px, AA kontrast.

## 11. `/qr` — QR Üretme ve Yazdırma

- `robots: noindex`.
- `qrcode` ile 3 SVG QR: genel menü, `?tab=restaurant`, `?tab=bufe` (mutlak URL,
  `site.ts` → `siteUrl` üzerinden).
- Her biri için yazdırılabilir masa kartı: logo slotu + "Menümüz için okutun" + QR +
  işletme adı + telefon.
- `@media print`: yalnızca kartlar yazdırılır, header/footer gizlenir, A5/A4 uyumlu.
- Sayfada kısa Türkçe kullanım açıklaması.

## 12. Görsel Slot Sistemi

- Klasörler: `/public/images/{brand,hero,home,restaurant,bufe,menu,gallery,og}/`
- Tek kaynak: `src/config/images.ts`:
  ```ts
  export type ImageSlot = {
    key: string; src: string | null; alt: string; ratio: string;
    recommended: string; note: string; priority?: boolean;
  }
  ```
- Sitedeki HER görsel bu dosyadan gelir; component içine `<Image src="/images/...">`
  doğrudan yazılmaz. Key grupları: `brand.logo`, `brand.logoLight`, `hero.slide1-2`,
  `home.welcome.1-2`, `home.split.video`, `home.featured.1-6`, `home.mosaic.1-4`,
  `home.parallax`, `home.trio.1-3`, `home.blockA.1-2`, `home.blockB.1-2`,
  `home.reviews.avatar.1-6`, `home.gallery.1-6`, `restaurant.hero`,
  `restaurant.intro.1-2`, `restaurant.gallery.1-4`, `bufe.hero`, `bufe.category.1-6`,
  `about.hero`, `about.wide`, `about.gallery.1-6`, `contact.hero`, `menu.item.<slug>`,
  `og.default`.
- `<SmartImage slot="..." />`: `src` doluysa next/image (fill+object-cover+sizes);
  `src` null ise markalı placeholder (brand-100 zemin, hafif nokta dokusu, ortada
  lucide `ImageIcon`, altında slot key + önerilen ölçü küçük punto) — kırık görsel/gri
  kutu asla görünmez. Koyu overlay bölümlerinde placeholder brand-900 varyantı. Her slot
  sabit aspect-ratio container içinde → CLS sıfır. `priority`/`sizes`/`loading` slot
  tanımından otomatik gelir.
- `menu.ts`/`bufe.ts` içindeki `image` alanı boş bırakılabilir → satır görselsiz/kompakt
  render edilir.
- `IMAGES.md` üretilecek: `slot key | sayfa/bölüm | dosya yolu | oran | önerilen px |
  içerik önerisi` tablosu, içerik önerisi sütunu görsel üretimi için brief niteliğinde
  yazılacak.

## 13. Config / Veri Dosyaları

```
src/config/site.ts     marka adı, iki işletmenin adı/telefon/WhatsApp, adres, harita
                        embed + yol tarifi linki, sosyal medya, haftalık çalışma saatleri,
                        showPrices bayrağı, video ID'leri, siteUrl (mutlak domain, TODO)
src/config/images.ts   görsel slotları
src/config/nav.ts      sol grup / sağ grup menü linkleri ayrı ayrı
src/data/menu.ts       restaurant menüsü (kategori → ürün[]) + günün tabldotu
src/data/bufe.ts       büfe ürünleri (kategori → ürün[])
src/data/faq.ts        SSS
src/data/reviews.ts    müşteri yorumları
src/data/features.ts   "Neden EGEM" maddeleri
```

`MenuItem = { name: string; desc?: string; price?: number; tags?: Tag[]; image?: string | null }`

İçerik hacmi: Restaurant ≥45 kalem (çorbalar, sulu yemekler, zeytinyağlılar, ızgara,
pilav/makarna, tatlı, içecek vb. gerçekçi Türk lokanta menüsü), Büfe ≥25 kalem (tost,
sandviç, sosisli/hamburger, kahvaltılık, atıştırmalık, içecek). Makul TL fiyatları +
`// TODO: fiyatlar müşteriden teyit edilecek`.

## 14. SEO / A11y / Performans

- Her sayfada benzersiz `metadata` (title/description/canonical/OG), `metadataBase`
  `site.ts` → `siteUrl`'den.
- JSON-LD: iki ayrı LocalBusiness — `Restaurant` (EGEM-TRAK) ve `FastFoodRestaurant`
  (EGEM Büfe) — `address`, `geo`, `openingHoursSpecification`, `telephone`, `hasMenu`
  (`/menu`), `servesCuisine: "Türk Mutfağı"`, `areaServed: "Çorlu, Tekirdağ"`.
- `sitemap.ts` + `robots.ts`; `/qr` noindex.
- A11y: WCAG AA kontrast, görünür focus ring, anlamlı alt metin, semantik HTML,
  akordiyon/sekme/slider klavye erişilebilir, Türkçe `aria-label`.
- Performans hedefi: Lighthouse mobil Performance 90+/Accessibility 95+/SEO 100. Font
  subset latin+latin-ext, harita iframe lazy, tüm görsel/iframe sabit oranlı container
  → CLS 0.

## 15. Responsive

Breakpoint: 360/640/768/1024/1280, mobil öncelikli. Mobilde tek sütun, min 16px gövde,
min 44px dokunma hedefi, min 12px nefes payı, yatay kaydırma (overflow-x) asla yok.
360px genişlikte kırılma test edilecek.

## 16. Dosya Yapısı

```
src/app/          layout.tsx, page.tsx, restaurant/, bufe/, menu/, hakkimizda/,
                   iletisim/, qr/, not-found.tsx, sitemap.ts, robots.ts
src/components/
  layout/          Header, SplitNav, Footer, MobileActionBar, MobileDrawer, ScrollTop
  ui/              Button, Badge, Section, Container, SectionTitle, SmartImage,
                   Accordion, Tabs, Lightbox, VideoModal
  sections/        anasayfa bölümleri (her biri ayrı dosya)
  menu/            MenuTabs, CategoryBar, MenuItemRow, MenuSearch
src/config/        site.ts, images.ts, nav.ts
src/data/          menu.ts, bufe.ts, faq.ts, reviews.ts, features.ts
src/lib/           utils.ts, hours.ts (açık/kapalı hesabı), useSlider.ts, useActiveSection.ts
public/images/     brand/ hero/ home/ restaurant/ bufe/ menu/ gallery/ og/
```

`page.tsx` dosyaları yalnızca section'ları dizer. 200 satırı geçen component parçalanır.

## 17. Teslimatlar

1. Çalışan proje (`npm run dev` hatasız, `npm run build` temiz)
2. `README.md` (Türkçe) — kurulum, görsel ekleme (3 adım: dosyayı `/public/images/<klasör>/`
   içine at → `images.ts`'de ilgili slot'un `src`'ini doldur → başka hiçbir yere dokunma),
   işletme bilgisi güncelleme, menü/fiyat güncelleme, QR yazdırma, deploy (Vercel öncelikli
   + genel Node host notu).
3. `IMAGES.md` — tüm görsel slotları tablosu
4. Lint + TypeScript hatasız

## 18. Kabul Kriterleri

- [ ] Header masaüstünde ortalanmış logo + sol ANASAYFA/RESTAURANT/BÜFE + sağ
      MENÜ/HAKKIMIZDA/İLETİŞİM şeklinde bölünmüş
- [ ] Anasayfada header hero üzerinde şeffaf, scroll'da koyu ve yapışkan
- [ ] Anasayfaya giren biri 3 saniyede iki ayrı işletme olduğunu ve hangisine
      gideceğini anlıyor
- [ ] Hiçbir yerde fiyat kartı + sepet + satın alma hissi yok
- [ ] Tek bir görsel bile eklenmemişken site profesyonel görünüyor
- [ ] Bir görselin `src`'sini doldurduğumda başka hiçbir dosyaya dokunmama gerek yok
      ve layout kaymıyor
- [ ] `/menu` telefonda tek elle rahat kullanılıyor, kategori barı yapışkan çalışıyor
- [ ] Sarı renk %5'i geçmiyor, art arda iki koyu section yok
- [ ] 360px genişlikte yatay kaydırma yok
- [ ] Restaurant ve büfe dili hiçbir yerde birbirine karışmıyor
- [ ] Telefon/WhatsApp/adres bilgisi yalnızca `site.ts`'de geçiyor
- [ ] Lighthouse mobil: Performance 90+, Accessibility 95+, SEO 100

## 19. Açık Teknik Kararlar (bu spec'te sabitlendi)

- **Site URL placeholder**: `src/config/site.ts` → `siteUrl: "https://www.egemtrak.com"`
  (`// TODO: müşteriden alınacak / gerçek domain bağlanacak`) — canonical, sitemap,
  JSON-LD ve `/qr` sayfasındaki mutlak QR URL'leri bunu kullanır.
- **Git**: proje klasöründe `git init` yapıldı; uygulama planı boyunca anlamlı commit'lerle
  ilerlenecek.
- **Paket yöneticisi**: npm.
- **Deploy hedefi**: README Vercel'i birincil olarak anlatır, genel Node host notu eklenir.
- **Faz stratejisi**: tek spec, ama uygulama planı şu sırayla fazlanır: (1) altyapı +
  config + design system + header/footer, (2) anasayfa bölümleri, (3) alt sayfalar
  (restaurant/bufe/hakkimizda/iletisim), (4) `/menu` sistemi, (5) `/qr` + SEO/JSON-LD +
  performans/a11y cilası.
