// İletişim formu e-postasının gerçek gönderimi.
//
// İki taşıyıcı desteklenir; hangisinin kullanılacağı `.env`'e göre otomatik seçilir:
//  1) Resend API  — RESEND_API_KEY tanımlıysa kullanılır (önerilen; düz `fetch`,
//                   ek servis yapılandırması gerekmez).
//  2) Gmail/SMTP  — SMTP_USER + SMTP_PASS tanımlıysa kullanılır (nodemailer).
//                   Gmail için 2 adımlı doğrulama + "uygulama şifresi" şarttır.
// Hiçbiri tanımlı değilse gönderim denenmez; `isMailerConfigured()` false döner.
//
// Not: Anahtarsız çalışan formsubmit.co denendi; sunucu taraflı isteklerde
// HTTP 500 döndürdüğü için kullanılmıyor (2026-09).
import nodemailer from 'nodemailer'
import { CONTACT_TO_EMAIL } from '@/lib/contact'

const TIMEOUT_MS = 10_000
const RESEND_DEFAULT_FROM = 'EGEM Web Sitesi <onboarding@resend.dev>'

export type MailMessage = {
  subject: string
  text: string
  html: string
  replyTo?: string
}

export type MailProvider = 'resend' | 'smtp'
export type MailResult = { ok: true; provider: MailProvider } | { ok: false; error: string }

/** `.env`'de bir gönderim yöntemi tanımlı mı? */
export function isMailerConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim())
  )
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const smtpUser = process.env.SMTP_USER?.trim()
  const smtpPass = process.env.SMTP_PASS?.trim()

  try {
    if (apiKey) {
      return await sendWithResend(apiKey, message)
    }
    if (smtpUser && smtpPass) {
      return await sendWithSmtp(smtpUser, smtpPass, message)
    }
    return {
      ok: false,
      error: 'E-posta sağlayıcısı tanımlı değil (RESEND_API_KEY veya SMTP_USER/SMTP_PASS).',
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Bilinmeyen e-posta hatası' }
  }
}

async function sendWithResend(apiKey: string, message: MailMessage): Promise<MailResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL?.trim() || RESEND_DEFAULT_FROM,
      to: [CONTACT_TO_EMAIL],
      subject: message.subject,
      text: message.text,
      html: message.html,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    return { ok: false, error: `Resend ${response.status}: ${body.slice(0, 300)}` }
  }

  return { ok: true, provider: 'resend' }
}

async function sendWithSmtp(user: string, pass: string, message: MailMessage): Promise<MailResult> {
  const port = Number(process.env.SMTP_PORT?.trim() || 465)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: TIMEOUT_MS,
  })

  await transporter.sendMail({
    // Gmail, gönderen adresini kimliği doğrulanmış hesapla eşleştirir.
    from: process.env.CONTACT_FROM_EMAIL?.trim() || `EGEM Web Sitesi <${user}>`,
    to: CONTACT_TO_EMAIL,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html,
  })

  return { ok: true, provider: 'smtp' }
}
