import type { ComponentProps } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import Lightbox from './Lightbox'
import type { ImageSlot } from '@/config/images'

vi.mock('next/image', () => ({
  default: (props: ComponentProps<'img'>) => <img {...props} alt={props.alt} />,
}))

const images: ImageSlot[] = [
  { key: 'a', src: '/a.jpg', alt: 'A görseli', ratio: '4/3', recommended: '1200x900', note: '' },
  { key: 'b', src: '/b.jpg', alt: 'B görseli', ratio: '4/3', recommended: '1200x900', note: '' },
]

describe('Lightbox', () => {
  it('activeIndex null iken hiçbir şey render etmez', () => {
    const { container } = render(<Lightbox images={images} activeIndex={null} onClose={() => {}} onNavigate={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sağ ok tuşu ile onNavigate bir sonraki indexle çağrılır', () => {
    const onNavigate = vi.fn()
    render(<Lightbox images={images} activeIndex={0} onClose={() => {}} onNavigate={onNavigate} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onNavigate).toHaveBeenCalledWith(1)
  })

  it('ESC ile onClose çağrılır', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} activeIndex={0} onClose={onClose} onNavigate={() => {}} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
