'use client'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useDebouncedValue } from '@/lib/useDebouncedValue'

type MenuSearchProps = {
  onChange: (query: string) => void
}

export default function MenuSearch({ onChange }: MenuSearchProps) {
  const [value, setValue] = useState('')
  const debounced = useDebouncedValue(value, 250)

  useEffect(() => {
    onChange(debounced)
  }, [debounced, onChange])

  return (
    <div className="relative px-4 py-3">
      <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Menüde ara..."
        aria-label="Menüde ara"
        className="min-h-[44px] w-full rounded-btn border border-line pl-10 pr-3 text-[15px]"
      />
    </div>
  )
}
