import { describe, it, expect } from 'vitest'
import { cn, formatPrice, formatTurkishDate, slugify } from './utils'

describe('cn', () => {
  it('boş/false/null/undefined değerleri filtreler ve birleştirir', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})

describe('formatPrice', () => {
  it('sayıyı Türk Lirası formatında döner', () => {
    expect(formatPrice(120)).toBe('120 ₺')
  })
})

describe('formatTurkishDate', () => {
  it('tarihi Türkçe uzun formatta döner', () => {
    expect(formatTurkishDate(new Date(2026, 8, 3))).toBe('3 Eylül 2026')
  })
})

describe('slugify', () => {
  it('Türkçe karakterleri ASCII\'ye çevirip kebab-case yapar', () => {
    expect(slugify('Zeytinyağlı Taze Fasülye')).toBe('zeytinyagli-taze-fasulye')
  })
})
