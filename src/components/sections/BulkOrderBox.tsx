import { MessageCircle } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/config/site'

export default function BulkOrderBox() {
  return (
    <Container className="py-4">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-brand-900 p-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
        <div>
          <h3 className="font-display text-xl font-extrabold">Toplu Yemek &amp; Kumanya</h3>
          <p className="mt-1 max-w-md text-white/80">
            Sanayi bölgesindeki işletmelere günlük öğle yemeği ve toplu paket servis hizmeti sunuyoruz.
          </p>
        </div>
        <Button href={siteConfig.social.whatsapp} variant="outline-light">
          <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          WhatsApp&apos;tan Yazın
        </Button>
      </div>
    </Container>
  )
}
