'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type LoopVideoProps = {
  webmSrc: string
  mp4Src: string
  poster: string
  ratio?: string
  className?: string
}

// Sessiz, döngüde oynayan vitrin videosu. Performans için:
// - Kaynaklar viewport'a yaklaşana kadar hiç yüklenmez (IntersectionObserver).
// - `prefers-reduced-motion` tercih edilmişse video hiç yüklenmez, yalnızca
//   poster kare (durağan görsel) gösterilir.
export default function LoopVideo({ webmSrc, mp4Src, poster, ratio = '16/9', className }: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldLoad) return
    const el = videoRef.current
    if (!el) return
    el.load()
    el.play().catch(() => {})
  }, [shouldLoad])

  return (
    <div className={cn('overflow-hidden', className)} style={{ aspectRatio: ratio }}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      >
        {shouldLoad && (
          <>
            <source src={webmSrc} type="video/webm" />
            <source src={mp4Src} type="video/mp4" />
          </>
        )}
      </video>
    </div>
  )
}
