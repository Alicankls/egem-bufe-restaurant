import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/hakkimizda' }))

describe('Header (diğer sayfalar)', () => {
  it('anasayfa dışında baştan koyu zemin kullanır', () => {
    render(<Header />)
    expect(screen.getByRole('banner').className).toContain('bg-brand-950')
  })
})
