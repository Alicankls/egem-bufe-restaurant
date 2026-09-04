import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Accordion from './Accordion'

const items = [
  { question: 'Soru 1', answer: 'Cevap 1' },
  { question: 'Soru 2', answer: 'Cevap 2' },
]

describe('Accordion', () => {
  it('defaultOpenIndex belirtilen maddeyi açık gösterir', () => {
    render(<Accordion items={items} defaultOpenIndex={0} />)
    expect(screen.getByText('Cevap 1')).toBeInTheDocument()
    expect(screen.queryByText('Cevap 2')).not.toBeInTheDocument()
  })

  it('başlığa tıklanınca ilgili madde açılır/kapanır', () => {
    render(<Accordion items={items} defaultOpenIndex={0} />)
    fireEvent.click(screen.getByText('Soru 2'))
    expect(screen.getByText('Cevap 2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Soru 1'))
    expect(screen.queryByText('Cevap 1')).not.toBeInTheDocument()
  })
})
