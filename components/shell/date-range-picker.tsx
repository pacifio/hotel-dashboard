"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { CalendarRange, Check, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  addMonths,
  CalendarMonth,
  type DateRange,
} from "@/components/motion/calendar-month"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { demoToday, isoDay, startOfMonth } from "@/lib/demo-time"
import {
  matchPreset,
  RANGE_PRESETS,
  rangeDays,
  resolvePreset,
  type PresetId,
} from "@/lib/report-range"
import { useUi } from "@/lib/store"

/**
 * The reporting window for the whole app. Presets on the left, two months of
 * calendar on the right; picking dates directly switches the selection to
 * "custom". Nothing is committed until Apply, so half-finished ranges never
 * flicker through the dashboards.
 */
/**
 * Open on the pair of months ending with the current one. A reporting range
 * looks backwards, so pairing the current month with a fully disabled future
 * month wastes half the panel.
 */
function openingMonth(from: string) {
  const latest = addMonths(startOfMonth(demoToday()), -1)
  const preferred = startOfMonth(new Date(from))
  return preferred < latest ? preferred : latest
}

export function DateRangePicker() {
  const { t, num, date: fmtDate } = useLocale()
  const committed = useUi((state) => state.reportRange)
  const setReportRange = useUi((state) => state.setReportRange)

  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<DateRange>({
    from: committed.from,
    to: committed.to,
  })
  const [cursor, setCursor] = React.useState(() => openingMonth(committed.from))
  const [hover, setHover] = React.useState<string | null>(null)

  const today = React.useMemo(() => demoToday(), [])
  const maxIso = isoDay(today)

  // Re-seed the draft whenever the panel opens so a cancelled edit is discarded.
  React.useEffect(() => {
    if (!open) return
    setDraft({ from: committed.from, to: committed.to })
    setCursor(openingMonth(committed.from))
    setHover(null)
  }, [open, committed.from, committed.to])

  const select = (day: Date) => {
    const iso = isoDay(day)
    if (!draft.from || draft.to || iso < draft.from) {
      setDraft({ from: iso, to: undefined })
      return
    }
    setDraft({ from: draft.from, to: iso })
  }

  const applyPreset = (id: PresetId) => {
    const resolved = resolvePreset(id)
    setReportRange(resolved)
    setOpen(false)
  }

  const apply = () => {
    if (!draft.from) return
    const from = draft.from
    const to = draft.to ?? draft.from
    setReportRange({ from, to, preset: matchPreset(from, to) })
    setOpen(false)
  }

  const previewTo =
    !draft.to && hover && draft.from && hover > draft.from ? hover : draft.to

  const draftDays =
    draft.from && (draft.to ?? previewTo)
      ? rangeDays({
          from: draft.from,
          to: (draft.to ?? previewTo)!,
          preset: "custom",
        })
      : 0

  const activePresetLabel = RANGE_PRESETS.find(
    (preset) => preset.id === committed.preset
  )?.labelKey

  const sameDay = committed.from === committed.to
  const label = activePresetLabel
    ? t(activePresetLabel)
    : sameDay
      ? fmtDate(committed.from, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : `${fmtDate(committed.from, { day: "numeric", month: "short" })} — ${fmtDate(
          committed.to,
          { day: "numeric", month: "short", year: "numeric" }
        )}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            data-slot="date-range-trigger"
            title={t("range.label")}
            className={cn(
              "nums hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[0.625rem] whitespace-nowrap text-muted-foreground transition-colors sm:inline-flex",
              "hover:bg-muted hover:text-foreground",
              open && "bg-muted text-foreground"
            )}
          >
            <CalendarRange className="size-3" />
            {label}
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.18 }}
              className="opacity-60"
            >
              <ChevronRight className="size-3 rotate-90" />
            </motion.span>
          </button>
        }
      />
      <PopoverContent align="end" className="w-auto gap-0 p-0">
        <div className="flex">
          <div className="flex w-[148px] shrink-0 flex-col gap-0.5 border-r border-[var(--hairline)] p-2">
            <div className="micro px-1.5 pt-0.5 pb-1">{t("range.label")}</div>
            {RANGE_PRESETS.map((preset) => {
              const active = committed.preset === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-md px-2 text-left text-[0.6875rem] transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex-1 truncate">{t(preset.labelKey)}</span>
                  {active ? (
                    <Check className="size-3 shrink-0 text-primary" />
                  ) : null}
                </button>
              )
            })}
            {committed.preset === "custom" ? (
              <div className="mt-0.5 flex h-7 items-center rounded-md bg-accent px-2 text-[0.6875rem] font-medium text-accent-foreground">
                {t("range.custom")}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center justify-between px-3 pt-2.5">
              <button
                onClick={() => setCursor(addMonths(cursor, -1))}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <AnimatePresence mode="popLayout">
                {draftDays > 0 ? (
                  <motion.span
                    key={draftDays}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.16 }}
                    className="nums rounded-full bg-[color-mix(in_oklch,var(--primary)_13%,transparent)] px-2 py-0.5 text-[0.625rem] font-medium text-primary"
                  >
                    {t(draftDays === 1 ? "range.day" : "range.days", {
                      count: num(draftDays),
                    })}
                  </motion.span>
                ) : null}
              </AnimatePresence>
              <button
                onClick={() => setCursor(addMonths(cursor, 1))}
                disabled={isoDay(addMonths(cursor, 1)) > maxIso}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-35 disabled:hover:bg-transparent"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="flex gap-4 px-3 pt-1 pb-2">
              {[0, 1].map((offset) => {
                const month = addMonths(cursor, offset)
                return (
                  <div key={offset} className="w-[224px]">
                    <div className="pb-1.5 text-center text-xs font-medium">
                      {fmtDate(month, { month: "long" })}{" "}
                      <span className="text-muted-foreground">
                        {num(month.getUTCFullYear(), { useGrouping: false })}
                      </span>
                    </div>
                    <CalendarMonth
                      groupId="report-range"
                      month={month}
                      range={draft}
                      previewTo={previewTo}
                      onSelect={select}
                      onHover={setHover}
                      max={maxIso}
                      showHeader={false}
                    />
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 border-t border-[var(--hairline)] px-3 py-2">
              <span className="nums flex-1 truncate text-[0.625rem] text-muted-foreground">
                {draft.from
                  ? `${fmtDate(draft.from, { day: "numeric", month: "short" })} — ${
                      draft.to
                        ? fmtDate(draft.to, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "…"
                    }`
                  : t("bookings.selectDates")}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button size="sm" onClick={apply} disabled={!draft.from}>
                {t("range.apply")}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
