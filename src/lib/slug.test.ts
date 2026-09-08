import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateUniqueSlug } from './queries/categories'

vi.mock('@/lib/db', () => ({
  db: { category: { findFirst: vi.fn() } },
}))

import { db } from '@/lib/db'

describe('generateUniqueSlug', () => {
  beforeEach(() => vi.clearAllMocks())

  it('çakışma yoksa temel slug\'ı döner', async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    const slug = await generateUniqueSlug('RESTAURANT', 'Çorbalar')
    expect(slug).toBe('corbalar')
  })

  it('çakışma varsa -2 ekler', async () => {
    vi.mocked(db.category.findFirst)
      .mockResolvedValueOnce({ id: 'existing' } as never)
      .mockResolvedValueOnce(null)
    const slug = await generateUniqueSlug('RESTAURANT', 'Çorbalar')
    expect(slug).toBe('corbalar-2')
  })

  it('kendi id\'sini hariç tutar (düzenleme senaryosu)', async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    await generateUniqueSlug('RESTAURANT', 'Çorbalar', 'cat-1')
    expect(db.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { not: 'cat-1' } }) })
    )
  })
})
