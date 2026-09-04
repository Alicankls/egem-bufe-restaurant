import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import SectionTitle from '@/components/ui/SectionTitle'

export default function CenteredIntro() {
  return (
    <Section tone="white">
      <Container className="mx-auto max-w-2xl">
        <SectionTitle
          kicker="Neden EGEM"
          lead="Aynı çatı altında"
          strong="iki güvenilir seçenek"
          subtitle="İster masaya oturup sıcak bir tabldot yemek isteyin, ister aceleyle bir şeyler atıştırıp yolunuza devam edin — EGEM ikisini de aynı özenle sunar."
          align="center"
        />
      </Container>
    </Section>
  )
}
