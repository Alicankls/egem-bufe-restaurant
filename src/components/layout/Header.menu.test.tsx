import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/menu' }))

describe('Header (/menu)', () => {
  it('sadeleştirilmiş header gösterir: tam nav yok, Ara ve WhatsApp ikonları var', () => {
    render(<Header />)
    expect(screen.getByLabelText('Ara')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
    expect(screen.queryByText('RESTAURANT')).not.toBeInTheDocument()
    expect(screen.queryByText('HAKKIMIZDA')).not.toBeInTheDocument()
  })
})
