'use client'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import Button from '@/components/ui/Button'

type FormState = { name: string; email: string; phone: string; subject: string; message: string }
type FormErrors = Partial<Record<keyof FormState, string>>

const initialState: FormState = { name: '', email: '', phone: '', subject: '', message: '' }

function validate(values: FormState): FormErrors {
  const next: FormErrors = {}
  if (!values.name.trim()) next.name = 'Ad soyad zorunludur.'
  if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Geçerli bir e-posta girin.'
  if (!values.phone.trim()) next.phone = 'Telefon numarası zorunludur.'
  if (!values.subject.trim()) next.subject = 'Konu zorunludur.'
  if (values.message.trim().length < 10) next.message = 'Mesajınız en az 10 karakter olmalı.'
  return next
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  function handleChange(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setStatus('idle')
      return
    }
    try {
      // TODO: form gönderim entegrasyonu (e-posta servisi / API rotası)
      setStatus('success')
      setForm(initialState)
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            İsim
          </label>
          <input id="name" value={form.name} onChange={handleChange('name')} className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">
            Telefon
          </label>
          <input id="phone" value={form.phone} onChange={handleChange('phone')} className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]" />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="subject" className="mb-1 block text-sm font-medium text-ink">
            Konu
          </label>
          <input id="subject" value={form.subject} onChange={handleChange('subject')} className="min-h-[44px] w-full rounded-btn border border-line px-3 text-[15px]" />
          {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          Mesaj
        </label>
        <textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={handleChange('message')}
          className="w-full rounded-btn border border-line px-3 py-2 text-[15px]"
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
      <Button type="submit">Gönder</Button>
      {status === 'success' && (
        <p role="status" className="text-sm font-medium text-green-700">
          Mesajınız alındı, en kısa sürede dönüş yapacağız.
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-sm font-medium text-red-600">
          Bir şeyler ters gitti, lütfen tekrar deneyin.
        </p>
      )}
    </form>
  )
}
