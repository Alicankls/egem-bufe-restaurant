import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('değeri belirtilen gecikmeden sonra günceller', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } })
    expect(result.current).toBe('a')
    rerender({ value: 'ab' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('ab')
  })
})
