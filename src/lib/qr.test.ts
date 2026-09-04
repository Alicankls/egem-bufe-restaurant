import { describe, it, expect } from 'vitest'
import { generateQrSvg } from './qr'

describe('generateQrSvg', () => {
  it('geçerli bir SVG string üretir', async () => {
    const svg = await generateQrSvg('https://example.com/menu')
    expect(svg).toContain('<svg')
  })
})
