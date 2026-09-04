'use client'
import { useEffect, useState } from 'react'
import { X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type VideoModalProps = {
  videoId: string | null
  triggerClassName?: string
}

export default function VideoModal({ videoId, triggerClassName }: VideoModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!videoId) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Videoyu oynat"
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-brand-500 shadow-md transition-transform duration-200 hover:scale-105',
          triggerClassName
        )}
      >
        <Play className="h-6 w-6 fill-current" aria-hidden="true" />
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Video oynatıcı" className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/90 p-4">
          <button onClick={() => setOpen(false)} aria-label="Kapat" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-white">
            <X className="h-7 w-7" aria-hidden="true" />
          </button>
          <div className="aspect-video w-full max-w-3xl">
            <iframe
              className="h-full w-full rounded-lg"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title="Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}
