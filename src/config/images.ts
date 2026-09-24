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
  'brand.logo': slot({ key: 'brand.logo', alt: 'EGEM logosu', ratio: '200/52', recommended: '400x104', note: 'Açık/beyaz zeminde kullanılacak standart logo (şeffaf PNG/SVG) — /qr sayfasındaki yazdırılabilir kartlarda kullanılır' }),
  'brand.logoLight': slot({ key: 'brand.logoLight', alt: 'EGEM logosu (beyaz)', ratio: '200/52', recommended: '400x104', note: 'Şeffaf header için beyaz varyant logo' }),

  'hero.slide1': slot({ key: 'hero.slide1', alt: 'EGEM-TRAK Restaurant\'ta sıcak yemek servisi', ratio: '16/9', recommended: '1920x1080', note: 'Tezgahtan geniş çekim, sıcak ışık, dolu tabaklar', priority: true }),
  'hero.slide2': slot({ key: 'hero.slide2', alt: 'EGEM Büfe\'de hazırlanan tost ve sandviç', ratio: '16/9', recommended: '1920x1080', note: 'Büfe tezgahı, hızlı hazırlık anı, canlı renkler', priority: true }),

  'home.welcome.1': { ...slot({ key: 'home.welcome.1', alt: 'EGEM-TRAK Restaurant bahçe/teras oturma alanı', ratio: '3/4', recommended: '900x1200', note: 'Salon/masalar, sıcak atmosfer' }), src: '/images/home/welcome-1.jpg' },
  'home.welcome.2': { ...slot({ key: 'home.welcome.2', alt: 'EGEM Büfe iç mekan, raflar ve ürünler', ratio: '4/5', recommended: '900x1125', note: 'Aşçı elinden yemek, buğu/taze doku' }), src: '/images/home/welcome-2.jpg' },
  // home.split.video kaldırıldı: SplitPromo artık gerçek bir döngü video
  // dosyası kullanıyor (public/videos/home/), SmartImage slot sistemine
  // değil doğrudan LoopVideo bileşenine bağlı.

  'home.featured.1': slot({ key: 'home.featured.1', alt: 'Mercimek çorbası', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, üstten açı, sade tabak' }),
  'home.featured.2': slot({ key: 'home.featured.2', alt: 'Kuru fasulye', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, pilav yanında' }),
  'home.featured.3': slot({ key: 'home.featured.3', alt: 'Zeytinyağlı taze fasulye', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, doğal ışık' }),
  'home.featured.4': slot({ key: 'home.featured.4', alt: 'Karışık ızgara', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, ızgara dokusu belirgin' }),
  'home.featured.5': slot({ key: 'home.featured.5', alt: 'Kaşarlı tost', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, kesit görünümü' }),
  'home.featured.6': slot({ key: 'home.featured.6', alt: 'Sütlaç', ratio: '1/1', recommended: '600x600', note: 'Kare çekim, üstten açı' }),

  'home.mosaic.1': { ...slot({ key: 'home.mosaic.1', alt: 'EGEM-TRAK Restaurant teras oturma alanı', ratio: '1/1', recommended: '900x900', note: 'Restaurant bandı — büyük öne çıkan görsel' }), src: '/images/home/mosaic-1.jpg' },
  'home.mosaic.2': { ...slot({ key: 'home.mosaic.2', alt: 'EGEM Büfe reyonu ve tezgahı', ratio: '1/1', recommended: '900x900', note: 'Büfe bandı — büyük öne çıkan görsel' }), src: '/images/home/mosaic-2.jpg' },
  'home.mosaic.3': { ...slot({ key: 'home.mosaic.3', alt: 'EGEM Büfe oturma alanı ve reyon', ratio: '1/1', recommended: '900x900', note: 'Destek görsel, küçük kare' }), src: '/images/home/mosaic-3.jpg' },
  'home.mosaic.4': { ...slot({ key: 'home.mosaic.4', alt: 'Günlük mezeler ve taze ürün reyonu', ratio: '1/1', recommended: '900x900', note: 'Destek görsel, küçük kare' }), src: '/images/home/mosaic-4.jpg' },
  'home.mosaic.5': { ...slot({ key: 'home.mosaic.5', alt: 'Kuruyemiş ve atıştırmalık reyonu', ratio: '2/1', recommended: '1800x900', note: 'Destek görsel, geniş şerit' }), src: '/images/home/mosaic-5.jpg' },

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
