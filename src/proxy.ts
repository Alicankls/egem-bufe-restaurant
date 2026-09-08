// /admin/* altındaki her sayfayı korur, /admin/login hariç.
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${callbackUrl}`, req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
