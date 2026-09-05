import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { imageSlots } from '@/config/images'
import { cn } from '@/lib/utils'

type SmartImageProps = {
  slot: string
  className?: string
  sizes?: string
  dark?: boolean
  absolute?: boolean
}

export default function SmartImage({ slot, className, sizes = '100vw', dark = false, absolute = false }: SmartImageProps) {
  const data = imageSlots[slot]
  if (!data) {
    throw new Error(`Bilinmeyen görsel slotu: ${slot}`)
  }

  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{
        position: absolute ? 'absolute' : 'relative',
        aspectRatio: absolute ? undefined : data.ratio,
        width: absolute ? undefined : '100%',
      }}
    >
      {data.src ? (
        <Image src={data.src} alt={data.alt} fill sizes={sizes} priority={data.priority} className="object-cover" />
      ) : (
        <div
          className={cn(
            'flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[length:14px_14px] p-4 text-center',
            dark ? 'bg-brand-900 text-white/60' : 'bg-brand-100 text-brand-700/60'
          )}
        >
          <ImageIcon className="h-8 w-8" aria-hidden="true" />
          <span className="text-xs font-medium">{data.key}</span>
          <span className="text-[11px] opacity-70">{data.recommended}</span>
        </div>
      )}
    </div>
  )
}
