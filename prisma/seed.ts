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

  // DİKKAT — weekday konvansiyonu: veritabanı 0=Pazartesi .. 6=Pazar kullanır
  // (admin panelindeki HoursEditor de bu etiketlemeyi kullanır).
  // Bu, src/lib/hours.ts'teki WEEKDAY_ORDER'dan FARKLI bir konvansiyondur:
  // orası ['pazar', 'pazartesi', ...] yani Date.getDay() ile uyumlu
  // 0=Pazar .. 6=Cumartesi sırasını kullanır.
  // İki tarafı köprüleyen herhangi bir kod (ör. DB saatlerini public siteye
  // taşıyan bir katman) indeksleri açıkça çevirmek zorundadır.
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

  // `update: {}` — yukarıdaki Settings upsert'ü gibi kasıtlı olarak boş: seed
  // yeniden çalıştırıldığında admin panelinden düzenlenmiş çalışma saatlerini
  // ezmez, yalnızca eksik satırları oluşturur.
  for (const h of restaurantHours) {
    await db.dayHours.upsert({
      where: { settingsId_business_weekday: { settingsId: 'singleton', business: Business.RESTAURANT, weekday: h.weekday } },
      update: {},
      create: { ...h, settingsId: 'singleton', business: Business.RESTAURANT, isClosed: false },
    })
  }
  for (const h of bufeHours) {
    await db.dayHours.upsert({
      where: { settingsId_business_weekday: { settingsId: 'singleton', business: Business.BUFE, weekday: h.weekday } },
      update: {},
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
