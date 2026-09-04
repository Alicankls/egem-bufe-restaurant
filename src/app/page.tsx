import Hero from '@/components/sections/Hero'
import Welcome from '@/components/sections/Welcome'
import SplitPromo from '@/components/sections/SplitPromo'
import Featured from '@/components/sections/Featured'
import MosaicBanners from '@/components/sections/MosaicBanners'
import CenteredIntro from '@/components/sections/CenteredIntro'
import ParallaxSection from '@/components/sections/ParallaxSection'
import TrioStrip from '@/components/sections/TrioStrip'
import AltBlock from '@/components/sections/AltBlock'
import Reviews from '@/components/sections/Reviews'
import Gallery from '@/components/sections/Gallery'
import LocationHours from '@/components/sections/LocationHours'
import QrBand from '@/components/sections/QrBand'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Welcome />
      <SplitPromo />
      <Featured />
      <MosaicBanners />
      <CenteredIntro />
      <ParallaxSection />
      <TrioStrip />
      <AltBlock
        kicker="EGEM-TRAK Restaurant"
        title="Sıcak, doyurucu, güvenilir"
        text="Her gün değişen tabldot menümüzle, ev yemeği tadında doyurucu bir öğle molası sunuyoruz. Sanayi bölgesinin temposuna uygun, hızlı servisle."
        primaryCta={{ label: 'Menü', href: '/menu?tab=restaurant' }}
        secondaryCta={{ label: 'İletişim', href: '/iletisim' }}
        imageSlotTop="home.blockA.1"
        imageSlotBottom="home.blockA.2"
      />
      <AltBlock
        reverse
        kicker="EGEM Büfe"
        title="Hemen al, geç"
        text="Tost, sandviç, sosisli ve hamburger — sanayi bölgesinin temposuna uygun, hızlı ve pratik lezzetler dakikalar içinde hazır."
        primaryCta={{ label: 'Menü', href: '/menu?tab=bufe' }}
        secondaryCta={{ label: 'İletişim', href: '/iletisim' }}
        imageSlotTop="home.blockB.1"
        imageSlotBottom="home.blockB.2"
      />
      <Reviews />
      <Gallery />
      <LocationHours />
      <QrBand />
    </>
  )
}
