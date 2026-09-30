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
  'brand.logo': {
    ...slot({
      key: 'brand.logo',
      alt: 'EGEM',
      ratio: '200/52',
      recommended: '400x104',
      note: 'Açık/beyaz zeminde kullanılacak standart logo (şeffaf PNG) — /qr sayfasındaki yazdırılabilir kartlarda kullanılır',
      priority: true,
    }),
    src: '/images/brand/brand.logo.png',
  },
  'brand.logoLight': {
    ...slot({
      key: 'brand.logoLight',
      alt: 'EGEM',
      ratio: '200/52',
      recommended: '400x104',
      note: 'Şeffaf header için beyaz/krem varyant logo',
      priority: true,
    }),
    src: '/images/brand/brand.logoLight.png',
  },

  'hero.slide1': slot({ key: 'hero.slide1', alt: 'EGEM-TRAK Restaurant\'ta sıcak yemek servisi', ratio: '16/9', recommended: '1920x1080', note: 'Tezgahtan geniş çekim, sıcak ışık, dolu tabaklar', priority: true }),
  'hero.slide2': {
    ...slot({
      key: 'hero.slide2',
      alt: "EGEM Büfe'den menemen, tost, sandviç ve sosisli",
      ratio: '16/9',
      recommended: '1920x1080',
      note: 'Büfe tezgahı, hızlı hazırlık anı, canlı renkler',
      priority: true,
    }),
    src: '/images/home/bufe-hero.jpg',
  },

  'home.welcome.1': { ...slot({ key: 'home.welcome.1', alt: 'EGEM-TRAK Restaurant bahçe/teras oturma alanı', ratio: '3/4', recommended: '900x1200', note: 'Salon/masalar, sıcak atmosfer' }), src: '/images/home/welcome-1.jpg' },
  'home.welcome.2': { ...slot({ key: 'home.welcome.2', alt: 'EGEM Büfe iç mekan, raflar ve ürünler', ratio: '4/5', recommended: '900x1125', note: 'Aşçı elinden yemek, buğu/taze doku' }), src: '/images/home/welcome-2.jpg' },
  // home.split.video kaldırıldı: SplitPromo artık gerçek bir döngü video
  // dosyası kullanıyor (public/videos/home/), SmartImage slot sistemine
  // değil doğrudan LoopVideo bileşenine bağlı.

  'home.mosaic.1': { ...slot({ key: 'home.mosaic.1', alt: 'EGEM-TRAK Restaurant teras oturma alanı', ratio: '1/1', recommended: '900x900', note: 'Restaurant bandı — büyük öne çıkan görsel' }), src: '/images/home/mosaic-1.jpg' },
  'home.mosaic.2': { ...slot({ key: 'home.mosaic.2', alt: 'EGEM Büfe reyonu ve tezgahı', ratio: '1/1', recommended: '900x900', note: 'Büfe bandı — büyük öne çıkan görsel' }), src: '/images/home/mosaic-2.jpg' },
  'home.mosaic.3': { ...slot({ key: 'home.mosaic.3', alt: 'EGEM Büfe oturma alanı ve reyon', ratio: '1/1', recommended: '900x900', note: 'Destek görsel, küçük kare' }), src: '/images/home/mosaic-3.jpg' },
  'home.mosaic.4': { ...slot({ key: 'home.mosaic.4', alt: 'Günlük mezeler ve taze ürün reyonu', ratio: '1/1', recommended: '900x900', note: 'Destek görsel, küçük kare' }), src: '/images/home/mosaic-4.jpg' },
  'home.mosaic.5': { ...slot({ key: 'home.mosaic.5', alt: 'Kuruyemiş ve atıştırmalık reyonu', ratio: '2/1', recommended: '1800x900', note: 'Destek görsel, geniş şerit' }), src: '/images/home/mosaic-5.jpg' },

  'home.parallax': { ...slot({ key: 'home.parallax', alt: 'EGEM-TRAK Restaurant tabelası, ağaçlar ve cami silüeti', ratio: '21/9', recommended: '2400x1000', note: 'Geniş, sakin, markanın güven veren yüzü' }), src: '/images/home/parallax.jpg' },

  'home.trio.1': { ...slot({ key: 'home.trio.1', alt: 'EGEM-TRAK Restaurant giriş kapısı', ratio: '4/3', recommended: '1200x900', note: 'Giriş/kapı görünümü' }), src: '/images/home/trio-1.jpg' },
  'home.trio.2': { ...slot({ key: 'home.trio.2', alt: 'EGEM Büfe oturma alanı ve tezgahı', ratio: '4/3', recommended: '1200x900', note: 'İç mekan, masalar ve tezgah' }), src: '/images/home/trio-2.jpg' },
  'home.trio.3': { ...slot({ key: 'home.trio.3', alt: 'EGEM Büfe dış cephe tabelası', ratio: '4/3', recommended: '1200x900', note: 'Dış cephe/tabela görünümü' }), src: '/images/home/trio-3.jpg' },

  'home.blockA.1': { ...slot({ key: 'home.blockA.1', alt: 'EGEM-TRAK Restaurant günlük tabldot tabağı', ratio: '3/4', recommended: '900x1200', note: 'Restaurant tanıtım bloğu üst görsel' }), src: '/images/home/block-a-1.jpg' },
  'home.blockA.2': { ...slot({ key: 'home.blockA.2', alt: 'EGEM-TRAK Restaurant meze/ürün reyonu', ratio: '4/5', recommended: '900x1125', note: 'Restaurant tanıtım bloğu alt görsel' }), src: '/images/home/block-a-2.jpg' },
  'home.blockB.1': { ...slot({ key: 'home.blockB.1', alt: 'EGEM Büfe kaşarlı tost', ratio: '3/4', recommended: '900x1200', note: 'Büfe tanıtım bloğu üst görsel' }), src: '/images/home/block-b-1.jpg' },
  'home.blockB.2': { ...slot({ key: 'home.blockB.2', alt: 'EGEM Büfe menemen ve çay', ratio: '4/5', recommended: '900x1125', note: 'Büfe tanıtım bloğu alt görsel' }), src: '/images/home/block-b-2.jpg' },

  'home.reviews.avatar.1': slot({ key: 'home.reviews.avatar.1', alt: 'Müşteri fotoğrafı 1', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar, yoksa baş harf dairesi gösterilir' }),
  'home.reviews.avatar.2': slot({ key: 'home.reviews.avatar.2', alt: 'Müşteri fotoğrafı 2', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.3': slot({ key: 'home.reviews.avatar.3', alt: 'Müşteri fotoğrafı 3', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.4': slot({ key: 'home.reviews.avatar.4', alt: 'Müşteri fotoğrafı 4', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.5': slot({ key: 'home.reviews.avatar.5', alt: 'Müşteri fotoğrafı 5', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),
  'home.reviews.avatar.6': slot({ key: 'home.reviews.avatar.6', alt: 'Müşteri fotoğrafı 6', ratio: '1/1', recommended: '200x200', note: 'Yuvarlak avatar' }),

  'home.gallery.1': { ...slot({ key: 'home.gallery.1', alt: 'EGEM-TRAK Restaurant cam cepheli iç salon', ratio: '16/9', recommended: '1024x576', note: 'İç salon, cam cephe' }), src: '/images/home/gallery-1.jpg' },
  'home.gallery.2': { ...slot({ key: 'home.gallery.2', alt: 'Restoran iç salonu ve büfe vitrini', ratio: '16/9', recommended: '1024x576', note: 'İç salon ve vitrin' }), src: '/images/home/gallery-2.jpg' },
  'home.gallery.3': { ...slot({ key: 'home.gallery.3', alt: 'Bahçe terasında gri masalar ve saksı bitkileri', ratio: '16/9', recommended: '1024x576', note: 'Bahçe terası' }), src: '/images/home/gallery-3.jpg' },
  'home.gallery.4': { ...slot({ key: 'home.gallery.4', alt: 'EGEM Büfe girişi, soğutucular ve raflar', ratio: '16/9', recommended: '1024x576', note: 'Büfe girişi' }), src: '/images/home/gallery-4.jpg' },
  'home.gallery.5': { ...slot({ key: 'home.gallery.5', alt: 'TRAK Restaurant tenteli dış oturma alanı', ratio: '16/9', recommended: '1024x576', note: 'Dış cephe/tente' }), src: '/images/home/gallery-5.jpg' },
  'home.gallery.6': { ...slot({ key: 'home.gallery.6', alt: 'Bahçede ahşap kameriyeli oturma alanları', ratio: '16/9', recommended: '1024x576', note: 'Bahçe kameriyeler' }), src: '/images/home/gallery-6.jpg' },

  'restaurant.hero': {
    ...slot({
      key: 'restaurant.hero',
      alt: 'EGEM-TRAK Restaurant tenteli dış oturma alanı ve ahşap kameriyeler',
      ratio: '21/9',
      recommended: '2400x1000',
      note: 'Salon veya sıcak yemek geniş çekim',
      priority: true,
    }),
    src: '/images/restaurant/hero.jpg',
  },
  'restaurant.intro.1': {
    ...slot({ key: 'restaurant.intro.1', alt: 'Fırın tepside közlenmiş etli kavurma, patates kızartması ve soğanlı garnitür', ratio: '4/5', recommended: '900x1125', note: 'Lokanta iç mekan' }),
    src: '/images/restaurant/intro-1.jpg',
  },
  'restaurant.intro.2': {
    ...slot({ key: 'restaurant.intro.2', alt: 'Günlük tabldot: kuru fasulye, pirinç pilavı, mercimek çorbası, ekmek ve ayran', ratio: '4/5', recommended: '900x1125', note: 'Aşçı/mutfak' }),
    src: '/images/restaurant/intro-2.jpg',
  },
  // Aynı fotoğraflar home.gallery.1/5/3/2'de de kullanılıyor — anasayfa ve
  // /restaurant galerisi aynı dosyaları paylaşır, ayrı kopya tutulmuyor.
  'restaurant.gallery.1': {
    ...slot({ key: 'restaurant.gallery.1', alt: 'EGEM-TRAK Restaurant cam cepheli iç salon', ratio: '16/9', recommended: '1024x576', note: 'İç salon, cam cephe' }),
    src: '/images/home/gallery-1.jpg',
  },
  'restaurant.gallery.2': {
    ...slot({ key: 'restaurant.gallery.2', alt: 'TRAK Restaurant tenteli dış oturma alanı', ratio: '16/9', recommended: '1024x576', note: 'Dış cephe/tente' }),
    src: '/images/home/gallery-5.jpg',
  },
  'restaurant.gallery.3': {
    ...slot({ key: 'restaurant.gallery.3', alt: 'Bahçe terasında gri masalar ve saksı bitkileri', ratio: '16/9', recommended: '1024x576', note: 'Bahçe terası' }),
    src: '/images/home/gallery-3.jpg',
  },
  'restaurant.gallery.4': {
    ...slot({ key: 'restaurant.gallery.4', alt: 'Restoran iç salonu ve büfe vitrini', ratio: '16/9', recommended: '1024x576', note: 'İç salon ve vitrin' }),
    src: '/images/home/gallery-2.jpg',
  },

  'bufe.hero': {
    ...slot({
      key: 'bufe.hero',
      alt: 'EG-EM Büfe Tekel dış cephesi ve tabelaları',
      ratio: '21/9',
      recommended: '2400x1000',
      note: 'Büfe tezgahı geniş çekim, dinamik',
      priority: true,
    }),
    src: '/images/bufe/hero.jpg',
  },
  'bufe.category.1': slot({ key: 'bufe.category.1', alt: 'Tostlar kategorisi', ratio: '4/3', recommended: '900x675', note: 'Kaşarlı tost, kesit' }),
  'bufe.category.2': slot({ key: 'bufe.category.2', alt: 'Sandviçler kategorisi', ratio: '4/3', recommended: '900x675', note: 'Sandviç detay' }),
  'bufe.category.3': slot({ key: 'bufe.category.3', alt: 'Sosisli & hamburger kategorisi', ratio: '4/3', recommended: '900x675', note: 'Hamburger detay' }),
  'bufe.category.4': slot({ key: 'bufe.category.4', alt: 'Kahvaltılık kategorisi', ratio: '4/3', recommended: '900x675', note: 'Omlet/menemen' }),
  'bufe.category.5': slot({ key: 'bufe.category.5', alt: 'Atıştırmalık kategorisi', ratio: '4/3', recommended: '900x675', note: 'Patates kızartması' }),
  'bufe.category.6': slot({ key: 'bufe.category.6', alt: 'İçecekler kategorisi', ratio: '4/3', recommended: '900x675', note: 'Soğuk içecek/çay' }),

  'about.hero': {
    ...slot({
      key: 'about.hero',
      alt: 'Cami manzaralı teras, maç yayını ekranı ve oturma alanı',
      ratio: '21/9',
      recommended: '2400x1000',
      note: 'Ekip veya mekan geniş çekim',
      priority: true,
    }),
    src: '/images/about/hero.jpg',
  },
  'about.wide': {
    ...slot({
      key: 'about.wide',
      alt: 'EGEM-TRAK Restaurant iç salon, masalar ve oturma düzeni',
      ratio: '4/3',
      recommended: '1200x900',
      note: '"Lokantamız Hakkında" bloğunda görsel solda/metin sağda düzeninde kullanılır',
    }),
    src: '/images/about/wide.jpg',
  },
  'about.wideBand': {
    ...slot({
      key: 'about.wideBand',
      alt: 'EG-EM Büfe Tekel dış cephesi ve tabelaları',
      ratio: '16/9',
      recommended: '1920x1080',
      note: 'Değerler bölümünün altında tam genişlik bant, ekip/mekan birlikte',
    }),
    src: '/images/about/wide-band.jpg',
  },
  'about.gallery.1': {
    ...slot({ key: 'about.gallery.1', alt: 'EG-EM Büfe Tekel giriş cephesi', ratio: '4/3', recommended: '1200x900', note: 'Mekan' }),
    src: '/images/about/gallery-1.jpg',
  },
  'about.gallery.2': {
    ...slot({ key: 'about.gallery.2', alt: 'Büfe içi içecek dolabı, soğuk içecek çeşitleri', ratio: '4/3', recommended: '1200x900', note: 'Ekip' }),
    src: '/images/about/gallery-2.jpg',
  },
  'about.gallery.3': {
    ...slot({ key: 'about.gallery.3', alt: 'Kuruyemiş ve çerez reyonu', ratio: '4/3', recommended: '1200x900', note: 'Mutfak' }),
    src: '/images/about/gallery-3.jpg',
  },
  'about.gallery.4': {
    ...slot({ key: 'about.gallery.4', alt: 'Günlük meze ve salata vitrini', ratio: '4/3', recommended: '1200x900', note: 'Yemek' }),
    src: '/images/about/gallery-4.jpg',
  },
  'about.gallery.5': {
    ...slot({ key: 'about.gallery.5', alt: 'Meze vitrini ve kuruyemiş reyonu', ratio: '4/3', recommended: '1200x900', note: 'Servis anı' }),
    src: '/images/about/gallery-5.jpg',
  },
  'about.gallery.6': {
    ...slot({ key: 'about.gallery.6', alt: 'Büfe içi içki ve tütün reyonu', ratio: '4/3', recommended: '1200x900', note: 'Dış cephe' }),
    src: '/images/about/gallery-6.jpg',
  },

  'contact.hero': {
    ...slot({
      key: 'contact.hero',
      alt: 'EG-EM Trak Restaurant ve EG-EM Büfe Tekel iletişim bilgileri afişi',
      ratio: '21/9',
      recommended: '2400x600',
      note: 'İnce bant, sade/koyu görsel',
    }),
    src: '/images/iletisim/hero.jpg',
  },

  'og.default': slot({ key: 'og.default', alt: 'EGEM-TRAK Restaurant & EGEM Büfe', ratio: '1200/630', recommended: '1200x630', note: 'Sosyal paylaşım kapak görseli, logo + marka rengi zemin' }),
}
