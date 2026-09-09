// Sidebar navigasyonunun tek kaynağı.
export type AdminIcon = 'grid' | 'tag' | 'box' | 'calendar' | 'settings'

export type AdminNavLink = { type: 'link'; label: string; href: string; icon: AdminIcon }
export type AdminNavGroup = { type: 'group'; label: string; items: { label: string; href: string; icon: AdminIcon }[] }
export type AdminNavEntry = AdminNavLink | AdminNavGroup

export const adminNav: AdminNavEntry[] = [
  { type: 'link', label: 'Dashboard', href: '/admin/dashboard', icon: 'grid' },
  {
    type: 'group',
    label: 'Restaurant',
    items: [
      { label: 'Kategoriler', href: '/admin/restaurant/kategoriler', icon: 'tag' },
      { label: 'Ürünler', href: '/admin/restaurant/urunler', icon: 'box' },
      { label: 'Günün Menüsü', href: '/admin/restaurant/gunun-menusu', icon: 'calendar' },
    ],
  },
  {
    type: 'group',
    label: 'Büfe',
    items: [
      { label: 'Kategoriler', href: '/admin/bufe/kategoriler', icon: 'tag' },
      { label: 'Ürünler', href: '/admin/bufe/urunler', icon: 'box' },
    ],
  },
  { type: 'link', label: 'Ayarlar', href: '/admin/settings', icon: 'settings' },
]
