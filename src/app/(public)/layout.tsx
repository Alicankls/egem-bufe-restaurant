import PublicChrome from '@/components/layout/PublicChrome'

// `(public)` route group layout'u — URL'leri değiştirmez, yalnızca halka açık
// sayfaları site çerçevesiyle sarar. `/admin/*` bu grubun dışında olduğu için
// Header/Footer/MobileActionBar almaz.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicChrome>{children}</PublicChrome>
}
