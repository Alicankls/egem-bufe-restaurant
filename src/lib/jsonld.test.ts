import { describe, it, expect } from 'vitest'
import { getRestaurantJsonLd, getBufeJsonLd } from './jsonld'

describe('getRestaurantJsonLd', () => {
  it('Restaurant tipinde ve gerekli alanları içerir', () => {
    const data = getRestaurantJsonLd()
    expect(data['@type']).toBe('Restaurant')
    expect(data.hasMenu).toContain('/menu?tab=restaurant')
    expect(data.openingHoursSpecification.length).toBeGreaterThan(0)
    expect(data.servesCuisine).toBe('Türk Mutfağı')
  })
})

describe('getBufeJsonLd', () => {
  it('FastFoodRestaurant tipinde ve gerekli alanları içerir', () => {
    const data = getBufeJsonLd()
    expect(data['@type']).toBe('FastFoodRestaurant')
    expect(data.hasMenu).toContain('/menu?tab=bufe')
  })
})
