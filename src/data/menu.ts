// Menü görünüm tipleri — public sitedeki menü bileşenlerinin ortak
// sözleşmesi. Gerçek veri artık burada değil, veritabanında (Product/Category)
// tutulur ve admin panelden yönetilir; bkz. `@/lib/queries/menu-view`.

export type MenuTag = 'acili' | 'vejetaryen' | 'yeni' | 'gunun-yemegi'

export type MenuItem = {
  name: string
  desc?: string
  price?: number
  tags?: MenuTag[]
  image?: string | null
  soldOut?: boolean
}

export type MenuCategory = {
  key: string
  title: string
  items: MenuItem[]
}
