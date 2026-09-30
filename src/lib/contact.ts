// İletişim formunun saf mantığı: doğrulama şeması + gönderilecek e-postanın
// konusu/gövdesi. Sunucu action'ı (`src/lib/actions/contact.ts`) bu dosyayı
// kullanır; istemci tarafındaki `validate()` fonksiyonu aynı kuralları
// (ve aynı hata metinlerini) yansıtır.
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Ad soyad zorunludur.'),
  email: z.string().trim().regex(/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta girin.'),
  phone: z.string().trim().min(1, 'Telefon numarası zorunludur.'),
  subject: z.string().trim().min(1, 'Konu zorunludur.'),
  message: z.string().trim().min(10, 'Mesajınız en az 10 karakter olmalı.'),
})

export type ContactInput = z.infer<typeof contactSchema>

// İletişim formundan gelen mesajların gönderileceği adres.
// `.env` dosyasındaki CONTACT_TO_EMAIL ile değiştirilebilir.
export const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL?.trim() || 'ozkanegemseeit@gmail.com'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type ContactEmail = {
  subject: string
  text: string
  html: string
  fields: Record<string, string>
}

export function buildContactEmail(data: ContactInput): ContactEmail {
  const subject = `Web Sitesi İletişim Formu — ${data.subject}`

  // Kimden geldiği `replyTo` ile ayarlanır (mailer'a aktarılır).
  const fields: Record<string, string> = {
    'Ad Soyad': data.name,
    'E-posta': data.email,
    Telefon: data.phone,
    Konu: data.subject,
    Mesaj: data.message,
  }

  const text = Object.entries(fields)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')

  const rows = Object.entries(fields)
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(
          value
        ).replace(/\n/g, '<br />')}</td></tr>`
    )
    .join('')

  const html = `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table style="font-family:sans-serif;font-size:14px">${rows}</table>`

  return { subject, text, html, fields }
}
