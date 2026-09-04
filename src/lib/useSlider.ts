'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export function getNextIndex(current: number, count: number): number {
  return (current + 1) % count
}

export function getPrevIndex(current: number, count: number): number {
  return (current - 1 + count) % count
}

export function useSlider(slideCount: number, intervalMs = 6000) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setIndex((i) => getNextIndex(i, slideCount)), [slideCount])
  const prev = useCallback(() => setIndex((i) => getPrevIndex(i, slideCount)), [slideCount])
  const goTo = useCallback((i: number) => setIndex(((i % slideCount) + slideCount) % slideCount), [slideCount])

  useEffect(() => {
    if (slideCount <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timerRef.current = setInterval(next, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [index, slideCount, intervalMs, next])

  return { index, next, prev, goTo }
}
