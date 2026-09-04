import Container from '@/components/ui/Container'
import SmartImage from '@/components/ui/SmartImage'
import VideoModal from '@/components/ui/VideoModal'
import { siteConfig } from '@/config/site'

const slots = ['home.trio.1', 'home.trio.2', 'home.trio.3'] as const

export default function TrioStrip() {
  return (
    <div className="relative z-10 -mt-14 bg-white pb-4 pt-6 lg:-mt-[60px]">
      <Container>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible" style={{ scrollSnapType: 'x mandatory' }}>
          {slots.map((slot, i) => (
            <div key={slot} className="relative min-w-[80%] shrink-0 overflow-hidden rounded-lg lg:min-w-0" style={{ scrollSnapAlign: 'start' }}>
              <SmartImage slot={slot} />
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoModal videoId={siteConfig.video.trio[i]} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
