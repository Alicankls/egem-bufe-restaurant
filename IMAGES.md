# Görsel Slotları

Bu tablo, `src/config/images.ts` içindeki tüm görsel slotlarını listeler. Bir görsel eklemek için:

1. Dosyayı aşağıdaki "Dosya Yolu" sütununda belirtilen klasöre at (`public` kökünden itibaren).
2. `src/config/images.ts` içinde ilgili slotun `src` alanını doldur (örn. `src: '/images/brand/logo.png'`).
3. Başka hiçbir dosyaya dokunma — layout otomatik olarak kayar, kırık görsel/placeholder görünmez.

| Slot Key | Sayfa / Bölüm | Dosya Yolu | Oran | Önerilen Boyut | İçerik Önerisi |
|---|---|---|---|---|---|
| brand.logo | /qr (yazdırılabilir kartlar, beyaz zemin) | /images/brand/logo.png | 200/52 | 400x104 | Açık/beyaz zeminde kullanılacak standart logo, şeffaf PNG/SVG |
| brand.logoLight | Header (şeffaf & sticky) / Footer | /images/brand/logo-light.png | 200/52 | 400x104 | Şeffaf header için beyaz varyant logo |
| hero.slide1 | Anasayfa Hero, slayt 1 | /images/hero/slide-1.jpg | 16/9 | 1920x1080 | Tezgahtan geniş çekim, sıcak ışık, dolu tabaklar |
| hero.slide2 | Anasayfa Hero, slayt 2 | /images/hero/slide-2.jpg | 16/9 | 1920x1080 | Büfe tezgahı, hızlı hazırlık anı, canlı renkler |
| home.welcome.1 | Anasayfa Hoşgeldiniz bloğu | /images/home/welcome-1.jpg | 3/4 | 900x1200 | Salon/masalar, sıcak atmosfer |
| home.welcome.2 | Anasayfa Hoşgeldiniz bloğu | /images/home/welcome-2.jpg | 4/5 | 900x1125 | Mutfaktan taze pişen yemek, buğu/taze doku |
| home.featured.1 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-1.jpg | 1/1 | 600x600 | Mercimek çorbası, üstten açı, sade tabak |
| home.featured.2 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-2.jpg | 1/1 | 600x600 | Kuru fasulye, pilav yanında |
| home.featured.3 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-3.jpg | 1/1 | 600x600 | Zeytinyağlı taze fasulye, doğal ışık |
| home.featured.4 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-4.jpg | 1/1 | 600x600 | Karışık ızgara, doku belirgin |
| home.featured.5 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-5.jpg | 1/1 | 600x600 | Kaşarlı tost, kesit görünümü |
| home.featured.6 | Anasayfa Öne Çıkan Lezzetler | /images/home/featured-6.jpg | 1/1 | 600x600 | Sütlaç, üstten açı |
| home.mosaic.1 | Anasayfa Mozaik Banner (Restaurant, büyük) | /images/home/mosaic-1.jpg | 1/1 | 900x900 | Restaurant teras/oturma alanı |
| home.mosaic.2 | Anasayfa Mozaik Banner (Büfe, büyük) | /images/home/mosaic-2.jpg | 1/1 | 900x900 | Büfe reyonu ve tezgahı |
| home.mosaic.3 | Anasayfa Mozaik Banner (destek, küçük) | /images/home/mosaic-3.jpg | 1/1 | 900x900 | Büfe oturma alanı |
| home.mosaic.4 | Anasayfa Mozaik Banner (destek, küçük) | /images/home/mosaic-4.jpg | 1/1 | 900x900 | Günlük mezeler / taze ürün reyonu |
| home.mosaic.5 | Anasayfa Mozaik Banner (destek, geniş şerit) | /images/home/mosaic-5.jpg | 2/1 | 1800x900 | Kuruyemiş ve atıştırmalık reyonu |
| home.parallax | Anasayfa Arka Plan Görselli Bölüm | /images/home/parallax.jpg | 21/9 | 2400x1000 | Lokantanın dış cephesi, geniş ve sakin |
| home.trio.1 | Anasayfa Üçlü Görsel Şeridi | /images/home/trio-1.jpg | 4/3 | 1200x900 | Restaurant giriş kapısı |
| home.trio.2 | Anasayfa Üçlü Görsel Şeridi | /images/home/trio-2.jpg | 4/3 | 1200x900 | Büfe oturma alanı ve tezgahı |
| home.trio.3 | Anasayfa Üçlü Görsel Şeridi | /images/home/trio-3.jpg | 4/3 | 1200x900 | Büfe dış cephe tabelası |
| home.blockA.1 | Anasayfa İkili Blok A (Restaurant) | /images/home/block-a-1.jpg | 3/4 | 900x1200 | Günlük tabldot tabağı |
| home.blockA.2 | Anasayfa İkili Blok A (Restaurant) | /images/home/block-a-2.jpg | 4/5 | 900x1125 | Meze/ürün reyonu |
| home.blockB.1 | Anasayfa İkili Blok B (Büfe) | /images/home/block-b-1.jpg | 3/4 | 900x1200 | Kaşarlı tost |
| home.blockB.2 | Anasayfa İkili Blok B (Büfe) | /images/home/block-b-2.jpg | 4/5 | 900x1125 | Menemen ve çay |
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

## Döngü Videosu (Anasayfa "Bugün Ne Var?" Bandı)

Bu bölüm `src/config/images.ts` slot sistemini kullanmaz — `src/components/ui/LoopVideo.tsx` üzerinden doğrudan `public/videos/home/` içindeki dosyalara bağlıdır:

- `public/videos/home/split-promo.webm` — birincil kaynak (VP9, daha küçük dosya)
- `public/videos/home/split-promo.mp4` — yedek kaynak (H.264, WebM desteklemeyen tarayıcılar için)
- `public/videos/home/split-promo-poster.jpg` — video yüklenene kadar gösterilen kapak kare

Videoyu değiştirmek için: yeni dosyayı sesini kaldırıp (`-an`) optimize ederek aynı üç dosya adıyla üzerine yazın (örn. `ffmpeg -i kaynak.mp4 -an -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart split-promo.mp4`). Video, viewport'a yaklaşana kadar yüklenmez ve `prefers-reduced-motion` tercih edilmişse hiç yüklenmez (yalnızca poster gösterilir).
