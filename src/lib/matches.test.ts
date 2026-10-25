import { describe, it, expect } from 'vitest'
import { selectFeaturedMatches, matchDayLabel } from './matches'

// 25 Ekim 2026, 18:00 Türkiye saati
const now = new Date('2026-10-25T18:00:00+03:00')

function m(iso: string, extra: { isPublished?: boolean; isFeatured?: boolean; id?: string } = {}) {
  return { id: extra.id ?? iso, kickoffAt: new Date(iso), isPublished: extra.isPublished ?? true, isFeatured: extra.isFeatured ?? false }
}

describe('selectFeaturedMatches', () => {
  it('bugün maç varsa bugünün maçını öne çıkarır', () => {
    const today = m('2026-10-25T21:00:00+03:00')
    const tomorrow = m('2026-10-26T20:00:00+03:00')
    expect(selectFeaturedMatches([tomorrow, today], now)).toEqual({ primary: today, others: [] })
  })

  it('bugün maç yoksa yarınki maçı gösterir', () => {
    const tomorrow = m('2026-10-26T20:00:00+03:00')
    expect(selectFeaturedMatches([tomorrow], now).primary).toBe(tomorrow)
  })

  it('aynı günün diğer maçlarını others olarak, öne çıkanı primary olarak döner', () => {
    const a = m('2026-10-27T17:00:00+03:00')
    const b = m('2026-10-27T20:00:00+03:00', { isFeatured: true })
    const later = m('2026-10-28T20:00:00+03:00')
    expect(selectFeaturedMatches([later, a, b], now)).toEqual({ primary: b, others: [a] })
  })

  it('yayında olmayan ve geçmiş maçları atlar', () => {
    const past = m('2026-10-25T10:00:00+03:00')
    const draft = m('2026-10-25T21:00:00+03:00', { isPublished: false })
    expect(selectFeaturedMatches([past, draft], now)).toEqual({ primary: null, others: [] })
  })
})

describe('matchDayLabel', () => {
  it('bugün, yarın ve sonrası için doğru rozeti döner', () => {
    expect(matchDayLabel(new Date('2026-10-25T21:00:00+03:00'), now)).toBe('BUGÜN')
    expect(matchDayLabel(new Date('2026-10-26T01:00:00+03:00'), now)).toBe('YARIN')
    expect(matchDayLabel(new Date('2026-10-29T20:00:00+03:00'), now)).toBe('YAKINDA')
  })
})
