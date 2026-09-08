import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, resetRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetRateLimit('1.2.3.4')
  })

  it('ilk 5 denemeye izin verir', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4').allowed).toBe(true)
    }
  })

  it('6. denemeyi 1 dakika içinde reddeder', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    const result = checkRateLimit('1.2.3.4')
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('1 dakika sonra tekrar izin verir', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    expect(checkRateLimit('1.2.3.4').allowed).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('1.2.3.4').allowed).toBe(true)
  })

  it('farklı anahtarlar birbirini etkilemez', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    expect(checkRateLimit('5.6.7.8').allowed).toBe(true)
  })

  it('resetRateLimit sayaci sifirlar', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4')
    expect(checkRateLimit('1.2.3.4').allowed).toBe(false)
    resetRateLimit('1.2.3.4')
    expect(checkRateLimit('1.2.3.4').allowed).toBe(true)
  })
})
