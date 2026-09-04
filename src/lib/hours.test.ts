import { describe, it, expect } from 'vitest'
import { getTodayHours, getTodayWeekday, getOpenStatus, type BusinessHours } from './hours'

const hours: BusinessHours = {
  pazartesi: { open: '08:00', close: '22:00' },
  sali: { open: '08:00', close: '22:00' },
  carsamba: { open: '08:00', close: '22:00' },
  persembe: { open: '08:00', close: '22:00' },
  cuma: { open: '08:00', close: '22:00' },
  cumartesi: { open: '09:00', close: '20:00' },
  pazar: null,
}

describe('getTodayHours', () => {
  it('JS gün indeksini (0=Pazar) doğru Weekday anahtarına eşler', () => {
    // 2026-09-07 Pazartesi
    expect(getTodayHours(hours, new Date(2026, 8, 7))).toEqual({ open: '08:00', close: '22:00' })
    // 2026-09-06 Pazar
    expect(getTodayHours(hours, new Date(2026, 8, 6))).toBeNull()
  })
})

describe('getTodayWeekday', () => {
  it('tarihten Weekday anahtarını döner', () => {
    expect(getTodayWeekday(new Date(2026, 8, 7))).toBe('pazartesi')
    expect(getTodayWeekday(new Date(2026, 8, 6))).toBe('pazar')
  })
})

describe('getOpenStatus', () => {
  it('açılış-kapanış arasındaysa açık döner', () => {
    const now = new Date(2026, 8, 7, 14, 0)
    const status = getOpenStatus(getTodayHours(hours, now), now)
    expect(status.isOpen).toBe(true)
    expect(status.label).toBe("Şu an açık · 22:00'a kadar")
  })

  it('kapanış saatinden sonraysa kapalı döner', () => {
    const now = new Date(2026, 8, 7, 23, 0)
    const status = getOpenStatus(getTodayHours(hours, now), now)
    expect(status.isOpen).toBe(false)
    expect(status.label).toBe('Şu an kapalı')
  })

  it('gün kapalıysa (null) kapalı döner', () => {
    const now = new Date(2026, 8, 6, 12, 0)
    const status = getOpenStatus(getTodayHours(hours, now), now)
    expect(status.isOpen).toBe(false)
    expect(status.label).toBe('Şu an kapalı')
  })
})
