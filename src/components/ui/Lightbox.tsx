'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ImageSlot } from '@/config/images'

type LightboxProps = {
  images: ImageSlot[]
  activeIndex: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function Lightbox({ images, activeIndex, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    if (activeIndex === null) return
    const idx = activeIndex
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate((idx + 1) % images.length)
      if (e.key === 'ArrowLeft') onNavigate((idx - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, images.length, onClose, onNavigate])

  if (activeIndex === null) return null
  const current = images[activeIndex]

  return (
    <div role="dialog" aria-modal="true" aria-label="Görsel galerisi" className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/90 p-4">
      <button onClick={onClose} aria-label="Kapat" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-white">
        <X className="h-7 w-7" aria-hidden="true" />
      </button>
      <button
        onClick={() => onNavigate((activeIndex - 1 + images.length) % images.length)}
        aria-label="Önceki görsel"
        className="absolute left-2 flex h-11 w-11 items-center justify-center text-white"
      >
        <ChevronLeft className="h-8 w-8" aria-hidden="true" />
      </button>
      <div className="relative aspect-[4/3] w-full max-w-3xl">
        {current.src ? (
          <Image src={current.src} alt={current.alt} fill className="object-contain" sizes="800px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-900 text-white/60">{current.key}</div>
        )}
      </div>
      <button
        onClick={() => onNavigate((activeIndex + 1) % images.length)}
        aria-label="Sonraki görsel"
        className="absolute right-2 flex h-11 w-11 items-center justify-center text-white"
      >
        <ChevronRight className="h-8 w-8" aria-hidden="true" />
      </button>
    </div>
  )
}
