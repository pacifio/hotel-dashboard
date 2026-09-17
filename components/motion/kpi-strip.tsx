"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { NumberTicker } from "./number-ticker"
import { Sparkline } from "./comb-chart"

export type KpiCell = {
  id: string
  label: string
  value: number
  delta?: number
  prefix?: string
  suffix?: string
  format?: React.ComponentProps<typeof NumberTicker>["format"]
  spark?: number[]
  color?: string
}

export function DeltaPill({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const { num } = useLocale()
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      data-slot="delta-pill"
      className={cn(
        "nums inline-flex h-4.5 items-center gap-0.5 rounded-full px-1.5 text-[0.625rem] font-medium",
        up
          ? "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]"
          : "bg-[color-mix(in_oklch,var(--destructive)_14%,transparent)] text-[var(--destructive)]",
        className
      )}
    >
      <Icon className="size-2.5" />
      {up ? "+" : ""}
      {num(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
    </span>
  )
}

/**
 * dashboard.jpg — KPI cells split by vertical hairlines, not individual cards.
 * Oversized, light-weight tabular figures; the delta rides beside the number.
 */
export function KpiStrip({
  cells,
  className,
}: {
  cells: KpiCell[]
  className?: string
}) {
  return (
    <div
      data-slot="kpi-strip"
      className={cn(
        "grid divide-x divide-[var(--hairline)] rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, index) => (
        <motion.div
          key={cell.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
          className="flex min-w-0 flex-col gap-2 px-4 py-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[0.6875rem] text-muted-foreground">
              {cell.label}
            </span>
            {cell.delta !== undefined ? <DeltaPill value={cell.delta} /> : null}
          </div>
          <div className="figure truncate text-[1.75rem] leading-none">
            <NumberTicker
              value={cell.value}
              format={cell.format}
              prefix={cell.prefix}
              suffix={cell.suffix}
            />
          </div>
          {cell.spark ? (
            <Sparkline
              values={cell.spark}
              color={cell.color ?? "var(--chart-1)"}
              className="mt-0.5 opacity-70"
            />
          ) : null}
        </motion.div>
      ))}
    </div>
  )
}
