"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { addDays, daysInMonth, isoDay } from "@/lib/demo-time"

export type DateRange = { from?: string; to?: string }

export function daysBetween(range: DateRange) {
  if (!range.from || !range.to) return 0
  return Math.max(
    0,
    Math.round(
      (new Date(range.to).getTime() - new Date(range.from).getTime()) / 86400000
    )
  )
}

export function addMonths(date: Date, delta: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1)
  )
}

/** Monday-first weekday initials in the active locale. */
export function useWeekdayInitials() {
  const { locale } = useLocale()
  return React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat(
      locale === "bn" ? "bn-BD" : "en-US",
      { weekday: "narrow" }
    )
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(Date.UTC(2024, 0, 1 + i)))
    )
  }, [locale])
}

/**
 * One month of a range calendar. Shared by the booking trip picker and the
 * reporting range picker so range fills, hover previews and the spring-driven
 * endpoint markers behave identically in both.
 */
export function CalendarMonth({
  month,
  range,
  previewTo,
  onSelect,
  onHover,
  min,
  max,
  /** Distinguishes the layoutId namespace when two months render side by side. */
  groupId,
  showHeader = true,
  onPrev,
  onNext,
  className,
}: {
  month: Date
  range: DateRange
  previewTo?: string
  onSelect: (day: Date) => void
  onHover?: (iso: string | null) => void
  min?: string
  max?: string
  groupId: string
  showHeader?: boolean
  onPrev?: () => void
  onNext?: () => void
  className?: string
}) {
  const { num, date: fmtDate } = useLocale()
  const weekdays = useWeekdayInitials()

  const cells = React.useMemo(() => {
    const total = daysInMonth(month)
    const firstDow = (month.getUTCDay() + 6) % 7
    return [
      ...Array.from({ length: firstDow }, () => null),
      ...Array.from({ length: total }, (_, i) => addDays(month, i)),
    ]
  }, [month])

  const to = previewTo ?? range.to

  return (
    <div className={cn("min-w-0", className)}>
      {showHeader ? (
        <div className="flex items-center justify-between pb-2">
          {onPrev ? (
            <button
              onClick={onPrev}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          ) : (
            <span className="size-6" />
          )}
          <div className="text-xs font-medium">
            {fmtDate(month, { month: "long" })}{" "}
            <span className="text-muted-foreground">
              {num(month.getUTCFullYear(), { useGrouping: false })}
            </span>
          </div>
          {onNext ? (
            <button
              onClick={onNext}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-3.5" />
            </button>
          ) : (
            <span className="size-6" />
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-7 gap-y-0.5">
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="pb-1 text-center text-[0.625rem] text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <span key={`pad-${index}`} />
          const iso = isoDay(day)
          const disabled = (min && iso < min) || (max && iso > max)
          const isFrom = iso === range.from
          const isTo = iso === to
          const inRange = !!range.from && !!to && iso > range.from && iso < to
          const edge = isFrom || isTo

          return (
            <button
              key={iso}
              disabled={!!disabled}
              onClick={() => onSelect(day)}
              onMouseEnter={() => onHover?.(iso)}
              onMouseLeave={() => onHover?.(null)}
              className={cn(
                "relative flex h-8 items-center justify-center text-xs transition-colors outline-none",
                disabled && "cursor-not-allowed text-muted-foreground/35",
                !disabled && !edge && "hover:text-foreground",
                !disabled && !edge && !inRange && "text-foreground/80"
              )}
            >
              {inRange ? (
                <motion.span
                  layout
                  className="absolute -inset-x-px inset-y-1 bg-[color-mix(in_oklch,var(--primary)_12%,transparent)]"
                />
              ) : null}
              {isFrom && to ? (
                <span className="absolute inset-y-1 right-0 left-1/2 bg-[color-mix(in_oklch,var(--primary)_12%,transparent)]" />
              ) : null}
              {isTo && range.from ? (
                <span className="absolute inset-y-1 right-1/2 left-0 bg-[color-mix(in_oklch,var(--primary)_12%,transparent)]" />
              ) : null}
              {edge ? (
                <motion.span
                  layoutId={`${groupId}-${isFrom ? "from" : "to"}`}
                  transition={{ type: "spring", stiffness: 560, damping: 42 }}
                  className="absolute inset-y-1 aspect-square rounded-full bg-primary"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 tabular-nums",
                  edge && "font-medium text-primary-foreground"
                )}
              >
                {num(day.getUTCDate(), { useGrouping: false })}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
