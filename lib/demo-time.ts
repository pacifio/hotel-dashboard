/**
 * The demo is anchored to the current UTC day so it always reads as "today",
 * while staying identical between the server render and the client hydrate.
 */
export const DAY_MS = 86_400_000

export function demoToday() {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS)
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

export function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function diffDays(a: Date | string, b: Date | string) {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / DAY_MS)
}

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

export function daysInMonth(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate()
}

export function eachDay(start: Date, count: number) {
  return Array.from({ length: count }, (_, i) => addDays(start, i))
}
