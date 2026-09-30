'use server'
// İletişim formunun Server Action'ı — doğrulama + basit rate limit + e-posta
// gönderimi. Admin action'larından farkı: bu action herkese açıktır, bu yüzden
// `requireAdmin()` yerine IP bazlı rate limit uygulanır (bkz. lib/rate-limit.ts).
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'
import { contactSchema, buildContactEmail, type ContactInput } from '@/lib/contact'
import { sendMail } from '@/lib/mailer'

export type ContactState = { error?: string }

export async function sendContactMessage(input: ContactInput): Promise<ContactState> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Login rate limiter'ıyla aynı sayaç kullanılır; anahtar önekiyle ayrılır.
  const rate = checkRateLimit(`iletisim:${ip}`)
  if (!rate.allowed) {
    return { error: 'Çok fazla mesaj gönderildi. Lütfen 1 dakika sonra tekrar deneyin.' }
  }

  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz veri.' }
  }

  const email = buildContactEmail(parsed.data)
  const result = await sendMail({
    subject: email.subject,
    text: email.text,
    html: email.html,
    replyTo: parsed.data.email,
  })

  if (!result.ok) {
    console.error('[iletisim] E-posta gönderilemedi:', result.error)
    return { error: 'Mesajınız gönderilemedi. Lütfen telefon veya WhatsApp ile ulaşın.' }
  }

  return {}
}
