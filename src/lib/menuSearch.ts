import type { MenuCategory, MenuItem } from '@/data/menu'

export function filterMenuCategories(categories: MenuCategory[], query: string): MenuCategory[] {
  const normalized = query.trim().toLocaleLowerCase('tr-TR')
  if (!normalized) return categories

  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => matchesQuery(item, normalized)),
    }))
    .filter((category) => category.items.length > 0)
}

function matchesQuery(item: MenuItem, normalized: string): boolean {
  const haystack = `${item.name} ${item.desc ?? ''}`.toLocaleLowerCase('tr-TR')
  return haystack.includes(normalized)
}
