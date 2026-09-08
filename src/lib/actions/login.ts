'use server'
// Login form'unun Server Action'ı — rate limit + Auth.js signIn + tek tip hata mesajı.
import { headers } from 'next/headers'
import { AuthError } from 'next-auth'
import { signIn } from '@/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export type LoginState = { error?: string }

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const callbackUrlRaw = formData.get('callbackUrl')
  const redirectTo = typeof callbackUrlRaw === 'string' && callbackUrlRaw ? callbackUrlRaw : '/admin/dashboard'

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const rate = checkRateLimit(ip)
  if (!rate.allowed) {
    return { error: 'Çok fazla deneme yapıldı. Lütfen 1 dakika sonra tekrar deneyin.' }
  }

  try {
    // Başarılı girişte signIn bir yönlendirme (redirect) fırlatır — bu nedenle
    // bu satırın altına başarı durumuna özel kod YAZILMAZ, asla çalışmaz.
    await signIn('credentials', { email, password, redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-posta veya şifre hatalı.' }
    }
    // AuthError değilse bu, signIn'in başarı durumunda fırlattığı yönlendirme
    // hatasıdır (veya beklenmeyen bir hata) — Next.js'in işlemesi için yeniden fırlatılır.
    throw error
  }

  return {}
}
