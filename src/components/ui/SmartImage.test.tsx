import type { ComponentProps } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SmartImage from './SmartImage'

vi.mock('next/image', () => ({
  default: (props: ComponentProps<'img'>) => {
    // eslint-disable-next-line jsx-a11y/alt-text,@next/next/no-img-element
    return <img {...props} />
  },
}))

vi.mock('@/config/images', () => ({
  imageSlots: {
    'test.empty': { key: 'test.empty', src: null, alt: 'Boş görsel', ratio: '1/1', recommended: '600x600', note: 'Not' },
    'test.filled': { key: 'test.filled', src: '/images/test.jpg', alt: 'Dolu görsel', ratio: '1/1', recommended: '600x600', note: 'Not' },
  },
}))

describe('SmartImage', () => {
  it('src null iken markalı placeholder gösterir, img render etmez', () => {
    render(<SmartImage slot="test.empty" />)
    expect(screen.getByText('test.empty')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('src doluyken next/image ile görseli render eder', () => {
    render(<SmartImage slot="test.filled" />)
    expect(screen.getByAltText('Dolu görsel')).toBeInTheDocument()
  })

  it('bilinmeyen slot için hata fırlatır', () => {
    expect(() => render(<SmartImage slot="test.yok" />)).toThrow()
  })

  it('absolute prop true iken kök elemanın inline stili position: absolute olur', () => {
    const { container } = render(<SmartImage slot="test.filled" absolute />)
    const root = container.firstChild as HTMLElement
    expect(root.style.position).toBe('absolute')
  })
})
