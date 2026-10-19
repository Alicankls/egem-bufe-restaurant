'use client'
import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

type LoopVideoProps = {
  webmSrc?: string
  mp4Src: string
  poster: string
  ratio?: string
  className?: string
  // true ise sağ alt köşede ses aç/kapat düğmesi gösterilir. Video yine
  // sessiz başlar (tarayıcılar sesli otomatik oynatmaya izin vermez).
  withSoundToggle?: boolean
  label?: string
}

// Sessiz, döngüde oynayan vitrin videosu. Performans için:
// - Kaynaklar viewport'a yaklaşana kadar hiç yüklenmez (IntersectionObserver).
// - `prefers-reduced-motion` tercih edilmişse video hiç yüklenmez, yalnızca
//   poster kare (durağan görsel) gösterilir.
export default function LoopVideo({ webmSrc, mp4Src, poster, ratio = '16/9', className, withSoundToggle = false, label }: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [muted, setMuted] = useState(true)

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

  function toggleSound() {
    const el = videoRef.current
    if (!el) return
    const next = !muted
    el.muted = next
    setMuted(next)
    // Hareket azaltma tercihinde video yüklenmemiş olabilir; ses isteyen
    // kullanıcı için şimdi yükleyip oynat.
    if (!next && !shouldLoad) setShouldLoad(true)
    else if (!next) el.play().catch(() => {})
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio: ratio }}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden={withSoundToggle ? undefined : true}
        aria-label={withSoundToggle ? label : undefined}
      >
        {shouldLoad && (
          <>
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            <source src={mp4Src} type="video/mp4" />
          </>
        )}
      </video>
      {withSoundToggle && (
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
          className="absolute bottom-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:bg-black/90"
        >
          {muted ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
        </button>
      )}
    </div>
  )
}
