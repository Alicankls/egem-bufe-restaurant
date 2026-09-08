'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu as MenuIcon, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

export default function AdminShell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState(pathname)

  // Rota değiştiğinde mobil çekmeceyi kapat (render sırasında state ayarlama —
  // useEffect içinde senkron setState'ten kaçınmak için React'in önerdiği desen).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setDrawerOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <div className="hidden lg:block">
        <Sidebar userEmail={userEmail} />
      </div>

      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-brand-950 px-4 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Menüyü aç"
          className="flex h-11 w-11 items-center justify-center text-white"
        >
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <span className="text-sm font-semibold text-white">EGEM Admin</span>
        <div className="w-11" aria-hidden="true" />
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin menüsü"
        inert={!drawerOpen ? true : undefined}
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn('absolute inset-0 bg-black/50 transition-opacity duration-200', drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
        />
        <div className={cn('absolute inset-y-0 left-0 transition-transform duration-200', drawerOpen ? 'translate-x-0' : '-translate-x-full')}>
          <div className="relative h-full">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Menüyü kapat"
              className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <Sidebar userEmail={userEmail} />
          </div>
        </div>
      </div>

      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
