import { MessageCircle } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/config/site'

export default function WhatsAppBox() {
  return (
    <Container className="py-4">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-brand-900 p-10 text-center text-white">
        <MessageCircle className="h-8 w-8 text-accent-500" aria-hidden="true" />
        <h3 className="font-display text-xl font-extrabold">WhatsApp&apos;tan yazın, hazır olsun</h3>
        <p className="max-w-sm text-white/80">Siparişinizi WhatsApp&apos;tan iletin, vardığınızda hazır bulun.</p>
        <Button href={`https://wa.me/${siteConfig.bufe.whatsapp}`} className="mt-2">
          WhatsApp&apos;tan Yaz
        </Button>
      </div>
    </Container>
  )
}
