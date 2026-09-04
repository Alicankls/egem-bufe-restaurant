import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileDrawer from './MobileDrawer'

describe('MobileDrawer', () => {
  it('isOpen false iken opacity-0 sınıfı taşır', () => {
    render(<MobileDrawer isOpen={false} onClose={() => {}} />)
    expect(screen.getByRole('dialog').className).toContain('opacity-0')
  })

  it('kapat butonuna tıklanınca onClose çağrılır', () => {
    const onClose = vi.fn()
    render(<MobileDrawer isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Menüyü kapat'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('ESC tuşuna basılınca onClose çağrılır', () => {
    const onClose = vi.fn()
    render(<MobileDrawer isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
