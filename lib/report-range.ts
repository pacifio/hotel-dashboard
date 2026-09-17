import { addDays, demoToday, isoDay, startOfMonth } from "@/lib/demo-time"
import type { TranslationKey } from "@/lib/i18n"

export type ReportRange = {
  from: string
  to: string
  /** "custom" once the user picks dates directly on the calendar. */
  preset: PresetId | "custom"
}

export const RANGE_PRESETS = [
  { id: "today", labelKey: "range.today" },
  { id: "yesterday", labelKey: "range.yesterday" },
  { id: "7d", labelKey: "range.last7" },
  { id: "30d", labelKey: "range.last30" },
  { id: "90d", labelKey: "range.last90" },
  { id: "thisMonth", labelKey: "range.thisMonth" },
  { id: "lastMonth", labelKey: "range.lastMonth" },
] as const satisfies readonly { id: string; labelKey: TranslationKey }[]

export type PresetId = (typeof RANGE_PRESETS)[number]["id"]

/**
 * Presets resolve against the demo's anchor day rather than the wall clock, so
 * the range a preset produces is identical on the server and the client.
 */
export function resolvePreset(preset: PresetId): ReportRange {
  const today = demoToday()

  switch (preset) {
    case "today":
      return { from: isoDay(today), to: isoDay(today), preset }
    case "yesterday": {
      const day = addDays(today, -1)
      return { from: isoDay(day), to: isoDay(day), preset }
    }
    case "7d":
      return { from: isoDay(addDays(today, -6)), to: isoDay(today), preset }
    case "30d":
      return { from: isoDay(addDays(today, -29)), to: isoDay(today), preset }
    case "90d":
      return { from: isoDay(addDays(today, -89)), to: isoDay(today), preset }
    case "thisMonth":
      return { from: isoDay(startOfMonth(today)), to: isoDay(today), preset }
    case "lastMonth": {
      const first = startOfMonth(today)
      const lastMonthEnd = addDays(first, -1)
      return {
        from: isoDay(startOfMonth(lastMonthEnd)),
        to: isoDay(lastMonthEnd),
        preset,
      }
    }
  }
}

export const DEFAULT_REPORT_RANGE = resolvePreset("30d")

/** Inclusive day count — a single-day range is 1 day, not 0. */
export function rangeDays(range: ReportRange) {
  return (
    Math.round(
      (new Date(range.to).getTime() - new Date(range.from).getTime()) /
        86_400_000
    ) + 1
  )
}

/** How far back the range starts from the anchor day, clamped to the series. */
export function rangeOffsetFromToday(range: ReportRange) {
  return Math.round(
    (demoToday().getTime() - new Date(range.to).getTime()) / 86_400_000
  )
}

/**
 * Window into the generated 181-day series, where index 90 is the anchor day.
 * Clamped so a range that reaches past the generated history still resolves.
 */
export function rangeSeriesSlice(range: ReportRange, todayIndex = 90) {
  const end = todayIndex - rangeOffsetFromToday(range) + 1
  const start = end - rangeDays(range)
  return {
    start: Math.max(0, Math.min(start, todayIndex)),
    end: Math.max(1, Math.min(end, todayIndex + 1)),
  }
}

/** Matches a free-form range back onto a preset so the UI can highlight it. */
export function matchPreset(from: string, to: string): PresetId | "custom" {
  for (const preset of RANGE_PRESETS) {
    const resolved = resolvePreset(preset.id)
    if (resolved.from === from && resolved.to === to) return preset.id
  }
  return "custom"
}
