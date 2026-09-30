'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateNoMatchMessage } from '@/lib/actions/matches'

export default function NoMatchMessageForm({ initialMessage }: { initialMessage: string }) {
  const [value, setValue] = useState(initialMessage)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateNoMatchMessage(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Mesaj kaydedildi.')
    })
  }

  return (
    <form action={handleSubmit} className="mb-8 flex flex-col gap-2 rounded-xl bg-white p-6 shadow-sm">
      <label htmlFor="noMatchMessage" className="text-sm font-medium text-ink">
        Maç olmayan günlerde gösterilecek mesaj
      </label>
      <p className="text-xs text-ink-soft">
        Bugün yayında maç yoksa anasayfada bunun yerine gösterilir. Boş bırakırsan sıradaki maç otomatik önerilir.
      </p>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row">
        <input
          id="noMatchMessage"
          name="noMatchMessage"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={160}
          placeholder="Örn: Cumartesi Galatasaray – Beşiktaş derbisi için bekliyoruz!"
          className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px] sm:flex-1"
        />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] shrink-0 rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          Kaydet
        </button>
      </div>
    </form>
  )
}
