import '@testing-library/jest-dom/vitest'

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// @ts-expect-error - test ortamı için basitleştirilmiş mock
global.IntersectionObserver = MockIntersectionObserver

// jsdom window.matchMedia sağlamaz — prefers-reduced-motion kontrolü yapan
// hook'lar (useSlider, useReveal) için sahte bir implementasyon tanımlanır.
window.matchMedia =
  window.matchMedia ||
  function matchMedia(query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList
  }
