import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'

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
    await user.type(screen.getByLabelText('Mesaj'), 'Merhaba, toplu sipariş hakkında bilgi almak istiyorum.')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))
    expect(await screen.findByText('Mesajınız alındı, en kısa sürede dönüş yapacağız.')).toBeInTheDocument()
  })
})
