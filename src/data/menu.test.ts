import { describe, it, expect } from 'vitest'
import { restaurantMenu, todaysSpecial } from './menu'

describe('restaurantMenu', () => {
  it('toplam en az 45 kalem içerir', () => {
    const total = restaurantMenu.reduce((sum, cat) => sum + cat.items.length, 0)
    expect(total).toBeGreaterThanOrEqual(45)
  })

  it('8 kategori içerir ve her kategorinin en az 1 ürünü var', () => {
    expect(restaurantMenu).toHaveLength(8)
    restaurantMenu.forEach((cat) => expect(cat.items.length).toBeGreaterThan(0))
  })

  it('her kategori benzersiz bir key taşır', () => {
    const keys = restaurantMenu.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('todaysSpecial', () => {
  it('bugünün tabldotunda en az 3 ürün adı bulunur ve bu adlar menüde geçer', () => {
    expect(todaysSpecial.items.length).toBeGreaterThanOrEqual(3)
    const allNames = restaurantMenu.flatMap((c) => c.items.map((i) => i.name))
    todaysSpecial.items.forEach((name) => expect(allNames).toContain(name))
  })
})
