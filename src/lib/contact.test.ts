import { describe, it, expect } from 'vitest'
import { contactSchema, buildContactEmail, CONTACT_TO_EMAIL } from './contact'

const valid = {
  name: 'Ayşe Yılmaz',
  email: 'ayse@example.com',
  phone: '05551234567',
  subject: 'Bilgi Talebi',
  message: 'Merhaba, menünüz hakkında bilgi almak istiyorum.',
}

describe('contactSchema', () => {
  it('geçerli veriyi kabul eder', () => {
    const result = contactSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('boş adı reddeder', () => {
    const result = contactSchema.safeParse({ ...valid, name: '   ' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Ad soyad zorunludur.')
    }
  })

  it('geçersiz e-postayı reddeder', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'ayse@example' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Geçerli bir e-posta girin.')
    }
  })

  it('10 karakterden kısa mesajı reddeder', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'kısa' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Mesajınız en az 10 karakter olmalı.')
    }
  })
})

describe('buildContactEmail', () => {
  it('alıcı adresi tanımlı ve geçerli görünür', () => {
    expect(CONTACT_TO_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })

  it('konuya form konusunu ekler', () => {
    const { subject } = buildContactEmail(valid)
    expect(subject).toContain('Bilgi Talebi')
  })

  it('tüm alanları düz metin ve tablo alanı olarak taşır', () => {
    const { text, fields } = buildContactEmail(valid)
    expect(fields['Ad Soyad']).toBe('Ayşe Yılmaz')
    expect(fields.Mesaj).toBe(valid.message)
    expect(text).toContain('Telefon: 05551234567')
  })

  it('HTML gövdesinde özel karakterleri kaçırır', () => {
    const { html } = buildContactEmail({ ...valid, message: '<script>alert(1)</script> merhaba' })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
