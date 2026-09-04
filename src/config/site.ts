// Tek kaynak: marka, işletme, iletişim ve saat bilgileri.
// Gerçek bilgiler netleşince yalnızca bu dosya güncellenir.
import type { BusinessHours } from '@/lib/hours'

const restaurantHours: BusinessHours = {
  pazartesi: { open: '08:00', close: '21:00' },
  sali: { open: '08:00', close: '21:00' },
  carsamba: { open: '08:00', close: '21:00' },
  persembe: { open: '08:00', close: '21:00' },
  cuma: { open: '08:00', close: '21:00' },
  cumartesi: { open: '08:00', close: '21:00' },
  pazar: { open: '09:00', close: '18:00' },
}

const bufeHours: BusinessHours = {
  pazartesi: { open: '07:00', close: '22:00' },
  sali: { open: '07:00', close: '22:00' },
  carsamba: { open: '07:00', close: '22:00' },
  persembe: { open: '07:00', close: '22:00' },
  cuma: { open: '07:00', close: '22:00' },
  cumartesi: { open: '07:00', close: '22:00' },
  pazar: { open: '08:00', close: '20:00' },
}

export const siteConfig = {
  brandName: 'EGEM',
  // TODO: müşteriden alınacak — gerçek domain bağlanınca güncellenecek
  siteUrl: 'https://www.egemtrak.com',
  restaurant: {
    name: 'EGEM-TRAK Restaurant',
    // TODO: müşteriden alınacak
    phone: '+902820000001',
    phoneDisplay: '0282 000 00 01',
    whatsapp: '905000000001',
    hours: restaurantHours,
  },
  bufe: {
    name: 'EGEM Büfe',
    // TODO: müşteriden alınacak
    phone: '+902820000002',
    phoneDisplay: '0282 000 00 02',
    whatsapp: '905000000002',
    hours: bufeHours,
  },
  address: {
    // TODO: müşteriden alınacak — tam adres
    line: 'Yeni Sanayi Bölgesi, Çorlu / Tekirdağ',
    // TODO: müşteriden alınacak — gerçek Google Maps embed linki
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d27.8014!3d41.1590',
    // TODO: müşteriden alınacak — gerçek yol tarifi linki
    directionsUrl: 'https://maps.google.com/?q=EGEM+Yeni+Sanayi+Bolgesi+Corlu',
    lat: 41.159,
    lng: 27.8014,
  },
  social: {
    // TODO: müşteriden alınacak
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
    whatsapp: 'https://wa.me/905000000001',
  },
  showPrices: true,
  video: {
    // TODO: müşteriden alınacak — YouTube video ID'si (boşsa play ikonu gizlenir)
    splitPromo: null as string | null,
    trio: [null, null, null] as (string | null)[],
  },
}
