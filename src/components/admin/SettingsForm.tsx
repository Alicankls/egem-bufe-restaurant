'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateSettings } from '@/lib/actions/settings'
import HoursEditor from './HoursEditor'
import type { SettingsWithHours } from '@/lib/queries/settings'

export default function SettingsForm({ settings }: { settings: SettingsWithHours }) {
  const [isPending, startTransition] = useTransition()
  const [themeColor, setThemeColor] = useState(settings.themeColor)
  const restaurantHours = settings.hours.filter((h) => h.business === 'RESTAURANT')
  const bufeHours = settings.hours.filter((h) => h.business === 'BUFE')

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Ayarlar kaydedildi.')
    })
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Genel</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="İşletme Adı" name="brandName" defaultValue={settings.brandName} />
          <Field
            label="Slogan"
            name="tagline"
            defaultValue={settings.tagline ?? ''}
            placeholder="Kısa ve dikkat çekici bir cümle"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="aboutText" className="mb-1 block text-sm font-medium text-ink">
            Hakkımızda Metni
          </label>
          <textarea
            id="aboutText"
            name="aboutText"
            rows={3}
            defaultValue={settings.aboutText ?? ''}
            className="w-full rounded-lg border border-line px-3 py-2 text-[15px]"
          />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">İletişim</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Restaurant Adı" name="restaurantName" defaultValue={settings.restaurantName} />
          <Field label="Restaurant Telefon" name="restaurantPhone" defaultValue={settings.restaurantPhone ?? ''} />
          <Field
            label="Restaurant WhatsApp"
            name="restaurantWhatsapp"
            defaultValue={settings.restaurantWhatsapp ?? ''}
            placeholder="05xx xxx xx xx"
          />
          <Field label="Büfe Adı" name="bufeName" defaultValue={settings.bufeName} />
          <Field label="Büfe Telefon" name="bufePhone" defaultValue={settings.bufePhone ?? ''} />
          <Field
            label="Büfe WhatsApp"
            name="bufeWhatsapp"
            defaultValue={settings.bufeWhatsapp ?? ''}
            placeholder="05xx xxx xx xx"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="Adres" name="address" defaultValue={settings.address ?? ''} />
          <Field label="Harita Embed URL" name="mapEmbedUrl" defaultValue={settings.mapEmbedUrl ?? ''} />
          <Field label="Yol Tarifi URL" name="directionsUrl" defaultValue={settings.directionsUrl ?? ''} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Instagram" name="instagram" defaultValue={settings.instagram ?? ''} />
          <Field label="Facebook" name="facebook" defaultValue={settings.facebook ?? ''} />
          <Field label="YouTube" name="youtube" defaultValue={settings.youtube ?? ''} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Çalışma Saatleri — Restaurant</h2>
        <div className="mt-4">
          <HoursEditor business="RESTAURANT" hours={restaurantHours} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Çalışma Saatleri — Büfe</h2>
        <div className="mt-4">
          <HoursEditor business="BUFE" hours={bufeHours} />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Görünüm</h2>
        <div className="mt-4 flex items-center gap-3">
          <input type="checkbox" id="showPrices" name="showPrices" defaultChecked={settings.showPrices} className="h-5 w-5" />
          <label htmlFor="showPrices" className="text-sm text-ink">
            Fiyatları canlı sitede göster
          </label>
        </div>
        <div className="mt-4 max-w-xs">
          <label htmlFor="themeColor" className="mb-1 block text-sm font-medium text-ink">
            Tema Rengi (yalnızca admin paneli arabirimini etkiler)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              aria-label="Tema rengi seçici"
              className="h-11 w-20 rounded-lg border border-line"
            />
            <input
              id="themeColor"
              name="themeColor"
              type="text"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              placeholder="#1A73C7"
              className="min-h-[44px] w-28 rounded-lg border border-line px-3 text-[15px]"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[44px] w-full rounded-lg bg-brand-500 text-sm font-semibold text-white disabled:opacity-60 sm:w-64"
      >
        Ayarları Kaydet
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  defaultValue: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-[44px] w-full rounded-lg border border-line px-3 text-[15px]"
      />
    </div>
  )
}
