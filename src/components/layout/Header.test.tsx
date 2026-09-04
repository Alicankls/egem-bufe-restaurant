import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('Header (anasayfa)', () => {
  it('başlangıçta şeffaf, 80px scroll sonrası koyu zemine geçer', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('bg-transparent')

    Object.defineProperty(window, 'scrollY', { value: 120, writable: true })
    fireEvent.scroll(window)

    expect(header.className).toContain('bg-brand-950')
  })
})
