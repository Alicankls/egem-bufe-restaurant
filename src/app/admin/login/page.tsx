'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import SmartImage from '@/components/ui/SmartImage'
import { loginAction, type LoginState } from '@/lib/actions/login'

const initialState: LoginState = {}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? ''
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-brand-900 p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <div className="h-11 w-40 overflow-hidden rounded-xl border-2 border-white/20">
            <SmartImage slot="brand.logoLight" className="h-full w-full" sizes="160px" dark />
          </div>
        </div>
        <p className="mb-6 text-center text-sm text-white/70">Menü yönetim panelinize hoş geldiniz.</p>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-white">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@egemtrak.com"
              className="min-h-[44px] w-full rounded-lg border-0 px-3 text-[15px] text-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-white">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="min-h-[44px] w-full rounded-lg border-0 px-3 text-[15px] text-ink"
            />
          </div>

          {state.error && (
            <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="min-h-[44px] w-full rounded-lg bg-ink text-[15px] font-semibold text-white disabled:opacity-60"
          >
            {isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
