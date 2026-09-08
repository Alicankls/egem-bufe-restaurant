'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Tag, Box, Calendar, Settings, LogOut, User } from 'lucide-react'
import SmartImage from '@/components/ui/SmartImage'
import { adminNav, type AdminIcon } from '@/config/admin-nav'
import { logoutAction } from '@/lib/actions/logout'
import { cn } from '@/lib/utils'

const iconMap: Record<AdminIcon, typeof LayoutGrid> = {
  grid: LayoutGrid,
  tag: Tag,
  box: Box,
  calendar: Calendar,
  settings: Settings,
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: AdminIcon; active: boolean }) {
  const Icon = iconMap[icon]
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-[14px] font-medium',
        active ? 'bg-brand-500 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  )
}

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="flex h-full w-64 flex-col bg-brand-950 px-4 py-6 text-white">
      <div className="mb-6 flex justify-center">
        <div className="h-10 w-36 overflow-hidden rounded-lg border border-white/20">
          <SmartImage slot="brand.logoLight" className="h-full w-full" sizes="144px" dark />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {adminNav.map((entry) =>
          entry.type === 'link' ? (
            <NavLink key={entry.href} href={entry.href} label={entry.label} icon={entry.icon} active={isActive(entry.href)} />
          ) : (
            <div key={entry.label} className="mt-3 first:mt-0">
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">{entry.label}</p>
              <div className="flex flex-col gap-1">
                {entry.items.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={isActive(item.href)} />
                ))}
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-2 flex items-center gap-2 px-3 text-xs text-white/50">
          <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{userEmail}</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </nav>
  )
}
