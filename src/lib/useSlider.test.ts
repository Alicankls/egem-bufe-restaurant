import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { getNextIndex, getPrevIndex, useSlider } from './useSlider'

describe('getNextIndex / getPrevIndex', () => {
  it('son slayttan sonra başa döner', () => {
    expect(getNextIndex(1, 2)).toBe(0)
  })
  it('ilk slayttan öncesi sona döner', () => {
    expect(getPrevIndex(0, 2)).toBe(1)
  })
})

describe('useSlider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('belirtilen sürede otomatik bir sonraki slayta geçer', () => {
    const { result } = renderHook(() => useSlider(2, 1000))
    expect(result.current.index).toBe(0)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.index).toBe(1)
  })

  it('next/prev/goTo doğru index üretir', () => {
    const { result } = renderHook(() => useSlider(3, 1000))
    act(() => result.current.next())
    expect(result.current.index).toBe(1)
    act(() => result.current.prev())
    expect(result.current.index).toBe(0)
    act(() => result.current.goTo(2))
    expect(result.current.index).toBe(2)
  })
})
