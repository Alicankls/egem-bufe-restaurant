import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'
import { sendContactMessage } from '@/lib/actions/contact'

// Server Action bu test ortamında gerçekten çalıştırılamaz (next/headers bir
// istek bağlamı ister) — bu yüzden modül mock'lanır.
vi.mock('@/lib/actions/contact', () => ({
  sendContactMessage: vi.fn(async () => ({})),
}))

describe('ContactForm', () => {
  it('boş form gönderilince hata mesajları gösterir', () => {
    render(<ContactForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Gönder' }))
    expect(screen.getByText('Ad soyad zorunludur.')).toBeInTheDocument()
  })

  it('geçerli veriyle gönderilince başarı mesajı gösterir', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText('İsim'), 'Ayşe Yılmaz')
    await user.type(screen.getByLabelText('E-posta'), 'ayse@example.com')
    await user.type(screen.getByLabelText('Telefon'), '05551234567')
    await user.type(screen.getByLabelText('Konu'), 'Bilgi Talebi')
    await user.type(screen.getByLabelText('Mesaj'), 'Merhaba, menünüz hakkında bilgi almak istiyorum.')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))
    expect(await screen.findByText('Mesajınız alındı, en kısa sürede dönüş yapacağız.')).toBeInTheDocument()
  })

  it('gönderirken form değerlerini server action\'a iletir', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText('İsim'), 'Ayşe Yılmaz')
    await user.type(screen.getByLabelText('E-posta'), 'ayse@example.com')
    await user.type(screen.getByLabelText('Telefon'), '05551234567')
    await user.type(screen.getByLabelText('Konu'), 'Bilgi Talebi')
    await user.type(screen.getByLabelText('Mesaj'), 'Merhaba, menünüz hakkında bilgi almak istiyorum.')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(sendContactMessage).toHaveBeenCalledWith({
      name: 'Ayşe Yılmaz',
      email: 'ayse@example.com',
      phone: '05551234567',
      subject: 'Bilgi Talebi',
      message: 'Merhaba, menünüz hakkında bilgi almak istiyorum.',
    })
  })

  it('server action hata dönerse hata mesajını gösterir', async () => {
    vi.mocked(sendContactMessage).mockResolvedValueOnce({ error: 'Mesajınız gönderilemedi.' })
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText('İsim'), 'Ayşe Yılmaz')
    await user.type(screen.getByLabelText('E-posta'), 'ayse@example.com')
    await user.type(screen.getByLabelText('Telefon'), '05551234567')
    await user.type(screen.getByLabelText('Konu'), 'Bilgi Talebi')
    await user.type(screen.getByLabelText('Mesaj'), 'Merhaba, menünüz hakkında bilgi almak istiyorum.')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Mesajınız gönderilemedi.')
  })
})
