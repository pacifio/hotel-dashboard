"use client"

import * as React from "react"
import { motion } from "motion/react"

import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import { SOURCE_LABEL } from "@/lib/labels"
import type { BookingSource } from "@/lib/types"

/** dashboard.jpg — a split segmented bar with gaps, not a solid stacked bar. */
export function ChannelMix() {
  const data = useDataset()
  const money = useMoney()
  const { locale, pct } = useLocale()

  const segments = React.useMemo(() => {
    const totals = new Map<BookingSource, number>()
    for (const reservation of data.reservations) {
      if (reservation.status === "cancelled") continue
      totals.set(
        reservation.source,
        (totals.get(reservation.source) ?? 0) + reservation.total
      )
    }
    const grand = [...totals.values()].reduce((sum, value) => sum + value, 0)
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, value], index) => ({
        source,
        value,
        share: (value / grand) * 100,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
  }, [data.reservations])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2 items-stretch gap-1">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.source}
            initial={{ flexGrow: 0, opacity: 0 }}
            animate={{ flexGrow: segment.share, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-full"
            style={{ background: segment.color, flexBasis: 0 }}
            title={SOURCE_LABEL[segment.source].en}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <div key={segment.source} className="flex items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: segment.color }}
            />
            <span className="truncate text-[0.6875rem] text-muted-foreground">
              {SOURCE_LABEL[segment.source][locale]}
            </span>
            <span className="nums ml-auto shrink-0 text-[0.6875rem] font-medium">
              {pct(segment.share, 0)}
            </span>
            <span className="nums w-16 shrink-0 text-right text-[0.625rem] text-muted-foreground">
              {money.compact(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
