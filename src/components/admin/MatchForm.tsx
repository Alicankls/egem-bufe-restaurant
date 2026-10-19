'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import Toggle from './Toggle'
import { createMatch, updateMatch } from '@/lib/actions/matches'
import { uploadMatchImage } from '@/lib/actions/upload'
import { toDateInputValue, toTimeInputValue } from '@/lib/matches'
import type { Match } from '@prisma/client'

const COMPETITION_SUGGESTIONS = ['Süper Lig', 'Şampiyonlar Ligi', 'Avrupa Ligi', 'Konferans Ligi', 'Türkiye Kupası', 'Milli Maç']

export default function MatchForm({ match }: { match?: Match }) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(match?.imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [isFeatured, setIsFeatured] = useState(match?.isFeatured ?? false)
  const [isPublished, setIsPublished] = useState(match?.isPublished ?? true)
  const [error, setError] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadMatchImage(formData)
    setUploading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setImageUrl(result.url ?? '')
  }

  function handleSubmit(formData: FormData) {
    formData.set('imageUrl', imageUrl)
    formData.set('isFeatured', String(isFeatured))
    formData.set('isPublished', String(isPublished))
    startTransition(async () => {
      const result = match ? await updateMatch(match.id, formData) : await createMatch(formData)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(match ? 'Maç güncellendi.' : 'Maç eklendi.')
      router.push('/admin/maclar')
    })
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-ink">Maç Bilgileri</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="homeTeam" className="mb-1 block text-sm font-medium text-ink">
              Ev Sahibi *
            </label>
            <input
              id="homeTeam"
              name="homeTeam"
              defaultValue={match?.homeTeam ?? ''}
              placeholder="Örn: Fenerbahçe"
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
          <div>
            <label htmlFor="awayTeam" className="mb-1 block text-sm font-medium text-ink">
              Deplasman *
            </label>
            <input
              id="awayTeam"
              name="awayTeam"
              defaultValue={match?.awayTeam ?? ''}
              placeholder="Örn: Galatasaray"
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="competition" className="mb-1 block text-sm font-medium text-ink">
            Lig / Turnuva *
          </label>
          <input
            id="competition"
            name="competition"
            list="competition-suggestions"
            defaultValue={match?.competition ?? ''}
            placeholder="Örn: Süper Lig"
            required
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
          <datalist id="competition-suggestions">
            {COMPETITION_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium text-ink">
              Tarih *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={match ? toDateInputValue(match.kickoffAt) : ''}
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
          <div>
            <label htmlFor="time" className="mb-1 block text-sm font-medium text-ink">
              Saat *
            </label>
            <input
              id="time"
              name="time"
              type="time"
              defaultValue={match ? toTimeInputValue(match.kickoffAt) : ''}
              required
              className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-ink-soft">Türkiye saatine göre girin.</p>

        <div>
          <label htmlFor="note" className="mb-1 block text-sm font-medium text-ink">
            Not
          </label>
          <input
            id="note"
            name="note"
            defaultValue={match?.note ?? ''}
            placeholder="Örn: Büyük ekranda, erken gelin yer sınırlı"
            className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white disabled:opacity-60"
          >
            {match ? 'Değişiklikleri Kaydet' : 'Maçı Ekle'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Fotoğraf</h2>
          <p className="-mt-2 text-xs text-ink-soft">Boş bırakılırsa anasayfada mekândan varsayılan bir fotoğraf kullanılır.</p>
          {imageUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Maç fotoğrafı" className="h-auto max-h-[70vh] w-full rounded-lg bg-black/5 object-contain" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                aria-label="Fotoğrafı kaldır"
                className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line px-4 text-center focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2">
              <UploadCloud className="h-8 w-8 text-ink-soft" aria-hidden="true" />
              <span className="text-sm font-medium text-ink">Fotoğraf yüklemek için tıklayın</span>
              <span className="text-xs text-ink-soft">PNG, JPG veya WEBP. En fazla 5MB.</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={uploading}
                aria-label="Maç fotoğrafı yükle"
                className="sr-only"
              />
            </label>
          )}
          {uploading && <p className="text-xs text-ink-soft">Yükleniyor...</p>}
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Durum</h2>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Yayında</p>
              <p className="text-xs text-ink-soft">Kapalıysa anasayfada görünmez.</p>
            </div>
            <Toggle checked={isPublished} onChange={setIsPublished} label="Yayında" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Öne Çıkar</p>
              <p className="text-xs text-ink-soft">Derbi gibi büyük maçlar için vurgulu kart.</p>
            </div>
            <Toggle checked={isFeatured} onChange={setIsFeatured} label="Öne Çıkar" />
          </div>
        </div>
      </div>
    </form>
  )
}
