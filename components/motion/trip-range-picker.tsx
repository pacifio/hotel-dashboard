"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { addDays, demoToday, isoDay, startOfMonth } from "@/lib/demo-time"
import {
  addMonths,
  CalendarMonth,
  daysBetween,
  type DateRange,
} from "./calendar-month"

export type { DateRange }

/** Nights are the gap between two dates, which is the same arithmetic. */
export const nightsBetween = daysBetween

const PRESETS = [
  { id: "weekend", labelKey: "bookings.presets.weekend" },
  { id: "threeNights", labelKey: "bookings.presets.threeNights" },
  { id: "oneWeek", labelKey: "bookings.presets.oneWeek" },
  { id: "twoWeeks", labelKey: "bookings.presets.twoWeeks" },
] as const

/**
 * date-range.mp4 — the trip-dates picker. Two header fields with an animated
 * underline on the active one, a month grid whose selected range fills with a
 * single spring-driven layout element, and quick-stay presets underneath.
 */
export function TripRangePicker({
  value,
  onChange,
  minDate,
  className,
  compact = false,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
  minDate?: Date
  className?: string
  compact?: boolean
}) {
  const { t, num, date: fmtDate } = useLocale()
  const today = React.useMemo(() => demoToday(), [])
  const floor = minDate ?? today
  const [cursor, setCursor] = React.useState(() =>
    startOfMonth(value.from ? new Date(value.from) : today)
  )
  const [focus, setFocus] = React.useState<"from" | "to">("from")
  const [hover, setHover] = React.useState<string | null>(null)

  const nights = nightsBetween(value)

  const select = (day: Date) => {
    const iso = isoDay(day)
    if (focus === "from" || !value.from || (value.from && value.to)) {
      onChange({ from: iso, to: undefined })
      setFocus("to")
      return
    }
    if (iso <= value.from) {
      onChange({ from: iso, to: undefined })
      return
    }
    onChange({ from: value.from, to: iso })
    setFocus("from")
  }

  const applyPreset = (id: (typeof PRESETS)[number]["id"]) => {
    const start = value.from ? new Date(value.from) : nextFriday(today)
    const lengths = { weekend: 2, threeNights: 3, oneWeek: 7, twoWeeks: 14 }
    const from = id === "weekend" ? nextFriday(today) : start
    onChange({ from: isoDay(from), to: isoDay(addDays(from, lengths[id])) })
    setCursor(startOfMonth(from))
    setFocus("from")
  }

  const previewTo =
    !value.to && hover && value.from && hover > value.from ? hover : value.to

  return (
    <div
      data-slot="trip-range-picker"
      className={cn(
        "flex w-full max-w-[380px] flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <span className="text-xs font-medium">{t("bookings.selectDates")}</span>
        <AnimatePresence mode="popLayout">
          {nights > 0 ? (
            <motion.span
              key={nights}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.16 }}
              className="nums rounded-full bg-[color-mix(in_oklch,var(--primary)_13%,transparent)] px-2 py-0.5 text-[0.625rem] font-medium text-primary"
            >
              {num(nights)} {t(nights === 1 ? "common.night" : "common.nights")}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mx-2 rounded-lg bg-card ring-1 ring-foreground/[0.07]">
        <div className="grid grid-cols-2 divide-x divide-[var(--hairline)]">
          {(["from", "to"] as const).map((field) => {
            const iso = field === "from" ? value.from : value.to
            const active = focus === field
            return (
              <button
                key={field}
                onClick={() => setFocus(field)}
                className="relative px-3 py-2.5 text-left outline-none"
              >
                <div className="micro">
                  {t(
                    field === "from"
                      ? "bookings.checkInDate"
                      : "bookings.checkOutDate"
                  )}
                </div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    iso ? "font-medium" : "text-muted-foreground"
                  )}
                >
                  {iso
                    ? fmtDate(iso, { day: "numeric", month: "short" })
                    : t("bookings.addDate")}
                </div>
                {active ? (
                  <motion.span
                    layoutId="trip-field-underline"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    className="absolute bottom-0 left-3 h-0.5 w-10 rounded-full bg-primary"
                  />
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="border-t border-[var(--hairline)] px-3 pt-2.5 pb-3">
          <CalendarMonth
            groupId="trip"
            month={cursor}
            range={value}
            previewTo={previewTo}
            onSelect={select}
            onHover={setHover}
            min={isoDay(floor)}
            onPrev={() => setCursor(addMonths(cursor, -1))}
            onNext={() => setCursor(addMonths(cursor, 1))}
          />
        </div>
      </div>

      {compact ? null : (
        <div className="flex items-center justify-between gap-1.5 px-3 py-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className="h-6 shrink-0 rounded-full border border-border px-2.5 text-[0.6875rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t(preset.labelKey)}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              onChange({})
              setFocus("from")
            }}
            className="shrink-0 text-[0.6875rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("common.clear")}
          </button>
        </div>
      )}
    </div>
  )
}

function nextFriday(from: Date) {
  const day = from.getUTCDay()
  return addDays(from, (5 - day + 7) % 7 || 7)
}
