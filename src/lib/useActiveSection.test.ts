import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useActiveSection } from './useActiveSection'

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    TestIntersectionObserver.instances.push(this)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = () => []
}

describe('useActiveSection', () => {
  it("görünür hale gelen section id'sini aktif olarak işaretler", () => {
    // @ts-expect-error test mock
    global.IntersectionObserver = TestIntersectionObserver
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>'

    const { result } = renderHook(() => useActiveSection(['a', 'b']))
    expect(result.current).toBe('a')

    const observerInstance = TestIntersectionObserver.instances.at(-1)!
    act(() => {
      observerInstance.callback(
        [{ isIntersecting: true, target: document.getElementById('b') } as unknown as IntersectionObserverEntry],
        observerInstance as unknown as IntersectionObserver
      )
    })
    expect(result.current).toBe('b')
  })
})
