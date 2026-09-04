// Çalışma saati / açık-kapalı hesaplama mantığı

export type Weekday = 'pazartesi' | 'sali' | 'carsamba' | 'persembe' | 'cuma' | 'cumartesi' | 'pazar'
export type DayHours = { open: string; close: string } | null
export type BusinessHours = Record<Weekday, DayHours>

const WEEKDAY_ORDER: Weekday[] = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi']

export function getTodayWeekday(now: Date = new Date()): Weekday {
  return WEEKDAY_ORDER[now.getDay()]
}

export function getTodayHours(hours: BusinessHours, now: Date = new Date()): DayHours {
  return hours[getTodayWeekday(now)]
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function getOpenStatus(dayHours: DayHours, now: Date = new Date()): { isOpen: boolean; label: string } {
  if (!dayHours) {
    return { isOpen: false, label: 'Şu an kapalı' }
  }
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = toMinutes(dayHours.open)
  const closeMinutes = toMinutes(dayHours.close)
  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes
  return {
    isOpen,
    label: isOpen ? `Şu an açık · ${dayHours.close}'a kadar` : 'Şu an kapalı',
  }
}
