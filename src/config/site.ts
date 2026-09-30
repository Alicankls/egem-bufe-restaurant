// Tek kaynak: marka, işletme, iletişim ve saat bilgileri.
// Gerçek bilgiler netleşince yalnızca bu dosya güncellenir.
import type { BusinessHours } from '@/lib/hours'

// Her iki işletme de haftanın 7 günü aynı saatlerle hizmet verir.
// DİKKAT — Restaurant'ın kapanışı 01:00, yani gece yarısını geçer (ertesi gün).
const restaurantHours: BusinessHours = {
  pazartesi: { open: '08:00', close: '01:00' },
  sali: { open: '08:00', close: '01:00' },
  carsamba: { open: '08:00', close: '01:00' },
  persembe: { open: '08:00', close: '01:00' },
  cuma: { open: '08:00', close: '01:00' },
  cumartesi: { open: '08:00', close: '01:00' },
  pazar: { open: '08:00', close: '01:00' },
}

const bufeHours: BusinessHours = {
  pazartesi: { open: '08:00', close: '22:00' },
  sali: { open: '08:00', close: '22:00' },
  carsamba: { open: '08:00', close: '22:00' },
  persembe: { open: '08:00', close: '22:00' },
  cuma: { open: '08:00', close: '22:00' },
  cumartesi: { open: '08:00', close: '22:00' },
  pazar: { open: '08:00', close: '22:00' },
}

// Site genelinde tek telefon numarası kullanılır: hem Restaurant hem Büfe
// aramaları ve WhatsApp hattı 0534 820 59 62'ye yönlenir.
const PHONE = '+905348205962'
const PHONE_DISPLAY = '0534 820 59 62'
const WHATSAPP_NUMBER = '905348205962'

// Site genelinde tek adres kaynağı: footer, iletişim bölümü, harita, JSON-LD
// ve tüm "Yol Tarifi" butonları bu değerlerden beslenir.
const ADDRESS_LINE = 'Zafer Mahallesi Acente 2. Sokak No:14, Çorlu / Tekirdağ'
const ADDRESS_QUERY = encodeURIComponent('Zafer Mahallesi Acente 2. Sokak No:14, Çorlu, Tekirdağ')

export const siteConfig = {
  brandName: 'EGEM',
  // TODO: müşteriden alınacak — gerçek domain bağlanınca güncellenecek
  siteUrl: 'https://www.egemtrak.com',
  restaurant: {
    name: 'EGEM-TRAK Restaurant',
    phone: PHONE,
    phoneDisplay: PHONE_DISPLAY,
    whatsapp: WHATSAPP_NUMBER,
    hours: restaurantHours,
  },
  bufe: {
    name: 'EGEM Büfe',
    phone: PHONE,
    phoneDisplay: PHONE_DISPLAY,
    whatsapp: WHATSAPP_NUMBER,
    hours: bufeHours,
  },
  address: {
    line: ADDRESS_LINE,
    // API anahtarı gerektirmeyen Google Maps embed biçimi (q=adres&output=embed).
    mapEmbedUrl: `https://maps.google.com/maps?q=${ADDRESS_QUERY}&z=16&output=embed`,
    // Adres tabanlı yol tarifi linki — sitedeki tüm "Yol Tarifi" butonları.
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${ADDRESS_QUERY}`,
    // Yaklaşık koordinat: Zafer Mahallesi merkezi. "Acente 2. Sokak" açık harita
    // verisinde kayıtlı olmadığı için mahalle merkezi kullanılmaktadır.
    lat: 41.1479,
    lng: 27.837,
  },
  // Sosyal medya: Facebook/Instagram/YouTube bağlantıları (ve ikonları) istek
  // üzerine siteden tamamen kaldırıldı. Yalnızca WhatsApp hattı kullanılıyor.
  social: {
    whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  },
  showPrices: true,
  video: {
    // TODO: müşteriden alınacak — YouTube video ID'si (boşsa play ikonu gizlenir)
    splitPromo: null as string | null,
    trio: [null, null, null] as (string | null)[],
  },
}
