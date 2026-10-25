// Maç yayınları için saat/tarih mantığı. Tek kaynak: hem anasayfa hem admin
// panel buradan içe aktarır, iki yerde ayrı mantık tekrarlanmaz.
//
// Türkiye 2016'dan beri sabit UTC+3'te (yaz saati uygulaması yok). Bu sayede
// "admin tarih+saat girdi" -> "gerçek an" dönüşümü sabit bir ofsetle güvenle
// yapılabilir; sunucu hangi saat diliminde çalışırsa çalışsın karşılaştırmalar
// (şu an vs. kickoffAt) her zaman doğru sonuç verir.
const ISTANBUL_OFFSET = '+03:00'

// Maçın "geçti" sayılması için kickoff'tan sonra beklenen süre — uzatma ve
// penaltılara giden maçlar için 2,5 değil 3 saat.
const PAST_AFTER_MS = 3 * 60 * 60 * 1000

export type MatchLike = {
  kickoffAt: Date
  isPublished: boolean
  isFeatured: boolean
}

// Maçın kendi fotoğrafı yoksa kullanılan varsayılan: mekânın terasından, büyük
// ekranda maç yayını görünen gerçek bir çekim (bkz. about.hero slotu).
export const DEFAULT_MATCH_IMAGE = '/images/about/hero.jpg'

/** Admin formundaki ayrı tarih ("YYYY-MM-DD") ve saat ("HH:mm") alanlarını tek bir UTC ana çevirir. */
export function parseKickoff(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00${ISTANBUL_OFFSET}`)
}

/** kickoffAt'ten admin formuna geri yazılacak "YYYY-MM-DD" tarih parçası (Türkiye takvim günü). */
export function toDateInputValue(kickoffAt: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(kickoffAt)
}

/** kickoffAt'ten admin formuna geri yazılacak "HH:mm" saat parçası (Türkiye saati). */
export function toTimeInputValue(kickoffAt: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(kickoffAt)
}

/** Maç, kickoff + 3 saat geçtiği için "geçmiş" sayılıyor mu? */
export function isPast(kickoffAt: Date, now: Date = new Date()): boolean {
  return now.getTime() > kickoffAt.getTime() + PAST_AFTER_MS
}

/** Maç bugün mü oynanıyor (Türkiye takvim günü karşılaştırması — sunucunun kendi saat dilimi fark etmez)? */
export function isToday(kickoffAt: Date, now: Date = new Date()): boolean {
  return toDateInputValue(kickoffAt) === toDateInputValue(now)
}

/** "Cumartesi, 27 Eylül" biçiminde, Türkiye takvimine göre. */
export function formatMatchDate(kickoffAt: Date): string {
  return new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', weekday: 'long', day: 'numeric', month: 'long' }).format(
    kickoffAt
  )
}

/** "20:00" biçiminde, Türkiye saatine göre. */
export function formatMatchTime(kickoffAt: Date): string {
  return toTimeInputValue(kickoffAt)
}

/** Yayında, henüz geçmemiş, kickoff'a göre sıralı tüm maçlar. */
function selectUpcoming<T extends MatchLike>(matches: T[], now: Date = new Date()): T[] {
  return matches
    .filter((m) => m.isPublished && !isPast(m.kickoffAt, now))
    .sort((a, b) => a.kickoffAt.getTime() - b.kickoffAt.getTime())
}

/** Maç yarın mı oynanıyor (Türkiye takvim günü)? */
export function isTomorrow(kickoffAt: Date, now: Date = new Date()): boolean {
  return isToday(kickoffAt, new Date(now.getTime() + 24 * 60 * 60 * 1000))
}

/** Büyük karttaki rozet: "BUGÜN", "YARIN" ya da daha ileri tarihler için "YAKINDA". */
export function matchDayLabel(kickoffAt: Date, now: Date = new Date()): string {
  if (isToday(kickoffAt, now)) return 'BUGÜN'
  if (isTomorrow(kickoffAt, now)) return 'YARIN'
  return 'YAKINDA'
}

/**
 * Anasayfada gösterilecek maçlar: yayında ve henüz geçmemiş maçlardan en
 * yakın günün maçları (bugün maç varsa bugün, yoksa yarın ya da sonraki ilk
 * maç günü). Büyük kartta gösterilecek "primary" maç: o günün öne çıkanı
 * (isFeatured), yoksa en erkeni; aynı günün kalan maçları "others" olarak
 * küçük satırlarda listelenir.
 */
export function selectFeaturedMatches<T extends MatchLike>(
  matches: T[],
  now: Date = new Date()
): { primary: T | null; others: T[] } {
  const upcoming = selectUpcoming(matches, now)
  if (upcoming.length === 0) return { primary: null, others: [] }

  const day = toDateInputValue(upcoming[0].kickoffAt)
  const sameDay = upcoming.filter((m) => toDateInputValue(m.kickoffAt) === day)
  const primary = sameDay.find((m) => m.isFeatured) ?? sameDay[0]
  return { primary, others: sameDay.filter((m) => m !== primary) }
}
