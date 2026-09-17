"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { HUE_VAR } from "@/lib/hue"
import {
  addDays,
  daysInMonth,
  demoToday,
  isoDay,
  startOfMonth,
} from "@/lib/demo-time"

type View = "month" | "week"

export default function BookingCalendarPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, date } = useLocale()

  const [month, setMonth] = React.useState(() => startOfMonth(demoToday()))
  const [view, setView] = React.useState<View>("month")
  const [selected, setSelected] = React.useState<string | null>(null)

  const today = React.useMemo(() => isoDay(demoToday()), [])
  const typeHue = React.useMemo(
    () => new Map(data.roomTypes.map((type) => [type.id, type.hue])),
    [data.roomTypes]
  )

  const cells = React.useMemo(() => {
    if (view === "week") {
      const start = addDays(demoToday(), -((demoToday().getUTCDay() + 6) % 7))
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }
    const total = daysInMonth(month)
    const firstDow = (month.getUTCDay() + 6) % 7
    return [
      ...Array.from({ length: firstDow }, (_, i) =>
        addDays(month, i - firstDow)
      ),
      ...Array.from({ length: total }, (_, i) => addDays(month, i)),
    ]
  }, [month, view])

  /** Arrivals per day — the calendar reads as "who is coming in", not a rack. */
  const byDay = React.useMemo(() => {
    const map = new Map<string, typeof data.reservations>()
    for (const reservation of data.reservations) {
      if (reservation.status === "cancelled") continue
      const list = map.get(reservation.checkIn) ?? []
      list.push(reservation)
      map.set(reservation.checkIn, list)
    }
    return map
  }, [data.reservations])

  const weekdays = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat(
      locale === "bn" ? "bn-BD" : "en-US",
      { weekday: "short" }
    )
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(Date.UTC(2024, 0, 1 + i)))
    )
  }, [locale])

  const selectedList = selected ? (byDay.get(selected) ?? []) : []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("bookings.title")}
        subtitle={date(month, { month: "long", year: "numeric" })}
      >
        <SegmentedPills
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: "month", label: t("common.thisMonth") },
            { value: "week", label: t("common.thisWeek") },
          ]}
        />
        <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5">
          <button
            onClick={() => setMonth(shift(month, -1))}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-3" />
          </button>
          <button
            onClick={() => setMonth(startOfMonth(demoToday()))}
            className="px-2 text-[0.6875rem] font-medium"
          >
            {t("common.today")}
          </button>
          <button
            onClick={() => setMonth(shift(month, 1))}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-3" />
          </button>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/bookings/new" />}
        >
          <CalendarPlus />
          {t("bookings.newBooking")}
        </Button>
      </PageHeader>

      <div className="flex min-h-0 flex-1 gap-3 px-5 pb-5">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="grid shrink-0 grid-cols-7 border-b border-[var(--hairline)]">
            {weekdays.map((day) => (
              <div key={day} className="micro px-2 py-2 text-center">
                {day}
              </div>
            ))}
          </div>
          <ScrollFade className="min-h-0 flex-1">
            <div
              className={cn(
                "grid grid-cols-7",
                view === "week" && "h-full grid-rows-1"
              )}
            >
              {cells.map((day, index) => {
                const iso = isoDay(day)
                const isToday = iso === today
                const outside =
                  view === "month" && day.getUTCMonth() !== month.getUTCMonth()
                const arrivals = byDay.get(iso) ?? []
                const revenue = arrivals.reduce((sum, r) => sum + r.total, 0)
                return (
                  <button
                    key={index}
                    onClick={() => setSelected(iso)}
                    className={cn(
                      "flex min-h-[104px] flex-col gap-1 border-r border-b border-[var(--hairline)] p-1.5 text-left transition-colors last:border-r-0",
                      outside && "bg-muted/25",
                      selected === iso
                        ? "bg-primary/[0.06]"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "nums flex size-5 items-center justify-center rounded-full text-[0.6875rem]",
                          isToday
                            ? "bg-primary font-medium text-primary-foreground"
                            : outside
                              ? "text-muted-foreground/50"
                              : "text-foreground"
                        )}
                      >
                        {num(day.getUTCDate(), { useGrouping: false })}
                      </span>
                      {arrivals.length > 0 ? (
                        <span className="nums text-[0.5625rem] text-muted-foreground">
                          {money.compact(revenue)}
                        </span>
                      ) : null}
                    </span>
                    {arrivals.slice(0, 3).map((reservation) => {
                      const guest = lookups.guest.get(reservation.guestId)
                      const hue = typeHue.get(reservation.roomTypeId) ?? "slate"
                      return (
                        <span
                          key={reservation.id}
                          style={{ ["--tag" as string]: HUE_VAR[hue] }}
                          className="bar-tint flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[0.625rem]"
                        >
                          <span className="truncate">
                            {guest?.name[locale] ?? reservation.code}
                          </span>
                        </span>
                      )
                    })}
                    {arrivals.length > 3 ? (
                      <span className="nums px-1 text-[0.5625rem] text-muted-foreground">
                        +{num(arrivals.length - 3)} {t("common.more")}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </ScrollFade>
        </div>

        {/* Day detail */}
        <AnimatePresence>
          {selected ? (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 38 }}
              className="shrink-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
            >
              <div className="flex w-[280px] flex-col">
                <div className="flex items-center justify-between border-b border-[var(--hairline)] px-3 py-2.5">
                  <span className="text-xs font-medium">
                    {date(selected, {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="nums rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
                    {num(selectedList.length)}
                  </span>
                </div>
                <ScrollFade className="max-h-[70vh] p-2">
                  {selectedList.map((reservation) => {
                    const guest = lookups.guest.get(reservation.guestId)
                    return (
                      <div
                        key={reservation.id}
                        className="mb-1.5 rounded-lg bg-surface p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[0.6875rem] font-medium">
                            {guest?.name[locale]}
                          </span>
                          <StatusTag
                            hue={typeHue.get(reservation.roomTypeId) ?? "slate"}
                            className="ml-auto"
                          >
                            {t(
                              `rooms.types.${reservation.roomTypeId}` as never
                            )}
                          </StatusTag>
                        </div>
                        <div className="nums mt-1 flex items-center gap-2 text-[0.625rem] text-muted-foreground">
                          <span>{reservation.code}</span>
                          <span>
                            {num(reservation.nights)} {t("common.nights")}
                          </span>
                          <span className="ml-auto font-medium text-foreground">
                            {money.compact(reservation.total)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {selectedList.length === 0 ? (
                    <p className="p-4 text-center text-[0.6875rem] text-muted-foreground">
                      {t("common.noResults")}
                    </p>
                  ) : null}
                </ScrollFade>
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

function shift(date: Date, delta: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1)
  )
}
