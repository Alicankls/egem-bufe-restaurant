import { describe, it, expect } from 'vitest'
import { bufeMenu } from './bufe'

describe('bufeMenu', () => {
  it('toplam en az 25 kalem içerir', () => {
    const total = bufeMenu.reduce((sum, cat) => sum + cat.items.length, 0)
    expect(total).toBeGreaterThanOrEqual(25)
  })

  it('6 kategori içerir', () => {
    expect(bufeMenu).toHaveLength(6)
  })

  it('her kategori benzersiz bir key taşır', () => {
    const keys = bufeMenu.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
