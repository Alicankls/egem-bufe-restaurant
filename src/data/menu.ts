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
