import { siteConfig } from '@/config/site'
import type { BusinessHours, Weekday } from '@/lib/hours'

const dayMap: Record<Weekday, string> = {
  pazartesi: 'Monday',
  sali: 'Tuesday',
  carsamba: 'Wednesday',
  persembe: 'Thursday',
  cuma: 'Friday',
  cumartesi: 'Saturday',
  pazar: 'Sunday',
}

function toOpeningHours(hours: BusinessHours) {
  return (Object.keys(hours) as Weekday[])
    .filter((day) => hours[day] !== null)
    .map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayMap[day],
      opens: hours[day]!.open,
      closes: hours[day]!.close,
    }))
}

export function getRestaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.restaurant.name,
    telephone: siteConfig.restaurant.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.line,
      addressLocality: 'Çorlu',
      addressRegion: 'Tekirdağ',
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: siteConfig.address.lat, longitude: siteConfig.address.lng },
    openingHoursSpecification: toOpeningHours(siteConfig.restaurant.hours),
    hasMenu: `${siteConfig.siteUrl}/menu?tab=restaurant`,
    servesCuisine: 'Türk Mutfağı',
    areaServed: 'Çorlu, Tekirdağ',
    url: siteConfig.siteUrl,
  }
}

export function getBufeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FastFoodRestaurant',
    name: siteConfig.bufe.name,
    telephone: siteConfig.bufe.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.line,
      addressLocality: 'Çorlu',
      addressRegion: 'Tekirdağ',
      addressCountry: 'TR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: siteConfig.address.lat, longitude: siteConfig.address.lng },
    openingHoursSpecification: toOpeningHours(siteConfig.bufe.hours),
    hasMenu: `${siteConfig.siteUrl}/menu?tab=bufe`,
    servesCuisine: 'Türk Mutfağı',
    areaServed: 'Çorlu, Tekirdağ',
    url: siteConfig.siteUrl,
  }
}
