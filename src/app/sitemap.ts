import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/restaurant', '/bufe', '/menu', '/hakkimizda', '/iletisim']
  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/menu' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))
}
