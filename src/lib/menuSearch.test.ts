import { describe, it, expect } from 'vitest'
import { filterMenuCategories } from './menuSearch'
import type { MenuCategory } from '@/data/menu'

const categories: MenuCategory[] = [
  { key: 'corbalar', title: 'Çorbalar', items: [{ name: 'Mercimek Çorbası', desc: 'Klasik' }, { name: 'Ezogelin Çorbası' }] },
  { key: 'tatlilar', title: 'Tatlılar', items: [{ name: 'Sütlaç' }] },
]

describe('filterMenuCategories', () => {
  it('boş sorguda tüm kategorileri değiştirmeden döner', () => {
    expect(filterMenuCategories(categories, '')).toEqual(categories)
  })

  it('isimde eşleşen ürünleri bulur, eşleşmeyen kategoriyi eler', () => {
    const result = filterMenuCategories(categories, 'mercimek')
    expect(result).toHaveLength(1)
    expect(result[0].items).toHaveLength(1)
    expect(result[0].items[0].name).toBe('Mercimek Çorbası')
  })

  it('açıklamada eşleşen ürünleri de bulur', () => {
    const result = filterMenuCategories(categories, 'klasik')
    expect(result[0].items[0].name).toBe('Mercimek Çorbası')
  })

  it('büyük/küçük harf duyarsızdır', () => {
    const result = filterMenuCategories(categories, 'SÜTLAÇ')
    expect(result[0].items[0].name).toBe('Sütlaç')
  })
})
