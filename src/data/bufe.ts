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
