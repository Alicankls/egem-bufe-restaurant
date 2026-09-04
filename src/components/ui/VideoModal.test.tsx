import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VideoModal from './VideoModal'

describe('VideoModal', () => {
  it('videoId null iken hiçbir şey render etmez', () => {
    const { container } = render(<VideoModal videoId={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('tetikleyiciye tıklanınca video açılır, ESC ile kapanır', () => {
    render(<VideoModal videoId="abc123" />)
    fireEvent.click(screen.getByLabelText('Videoyu oynat'))
    expect(screen.getByTitle('Video').getAttribute('src')).toContain('abc123')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTitle('Video')).not.toBeInTheDocument()
  })
})
