// Basit in-memory login rate limiter — süreç yeniden başladığında sıfırlanır,
// tek sunuculu/az trafikli bir admin paneli için yeterlidir.
const WINDOW_MS = 60_000
const MAX_ATTEMPTS = 5

type Entry = { count: number; resetAt: number }

const attempts = new Map<string, Entry>()

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count += 1
  return { allowed: true }
}

export function resetRateLimit(key: string): void {
  attempts.delete(key)
}
