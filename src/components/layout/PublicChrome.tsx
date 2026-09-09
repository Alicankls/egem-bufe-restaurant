// Halka açık sitenin ortak çerçevesi: JSON-LD, Header, Footer, mobil aksiyon
// çubuğu ve yukarı çık butonu. Hem `(public)` route group'unun layout'u hem de
// kök `not-found.tsx` bunu kullanır — admin panelinin kendi çerçevesi vardır ve
// bu bileşeni kullanmaz.
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileActionBar from '@/components/layout/MobileActionBar'
import ScrollTop from '@/components/layout/ScrollTop'
import { getRestaurantJsonLd, getBufeJsonLd } from '@/lib/jsonld'

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getRestaurantJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBufeJsonLd()) }} />
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileActionBar />
      <ScrollTop />
    </div>
  )
}
