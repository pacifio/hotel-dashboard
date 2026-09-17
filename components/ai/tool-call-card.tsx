"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Check, ChevronDown, Loader2, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { StatusTag } from "@/components/motion/status-tag"
import type { ToolCall } from "@/lib/ai/copilot"

/**
 * The visible proof that the copilot touched the ERP: a collapsible call header
 * with the arguments and latency, and beneath it a live component rendered from
 * this property's data — not a screenshot of one.
 */
export function ToolCallCard({
  tool,
  running,
}: {
  tool: ToolCall
  running: boolean
}) {
  const { t, locale, num } = useLocale()
  const [open, setOpen] = React.useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="overflow-hidden rounded-lg bg-surface ring-1 ring-foreground/[0.08]"
    >
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left outline-none"
      >
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded",
            running
              ? "bg-primary/15 text-primary"
              : "bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]"
          )}
        >
          {running ? (
            <Loader2 className="size-2.5 animate-spin" />
          ) : (
            <Check className="size-2.5" />
          )}
        </span>
        <Terminal className="size-3 shrink-0 text-muted-foreground" />
        <span className="truncate font-mono text-[0.625rem]">{tool.name}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {tool.rows ? (
            <span className="nums text-[0.625rem] text-muted-foreground">
              {num(tool.rows)} rows
            </span>
          ) : null}
          <span className="nums rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
            {t("ai.latency", { ms: num(tool.latencyMs) })}
          </span>
          <motion.span animate={{ rotate: open ? 0 : -90 }}>
            <ChevronDown className="size-3 text-muted-foreground" />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--hairline)] px-2.5 py-1.5 font-mono text-[0.625rem] text-muted-foreground">
              {tool.args[locale]}
            </div>
            {running ? (
              <div className="space-y-1.5 px-2.5 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.35, width: "30%" }}
                    animate={{ opacity: 1, width: ["82%", "58%", "70%"][i] }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="h-1.5 rounded-full bg-muted"
                  />
                ))}
              </div>
            ) : (
              <div className="px-2.5 pt-1 pb-2.5">
                <ToolResult tool={tool} />
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function ToolResult({ tool }: { tool: ToolCall }) {
  const data = useDataset()
  const money = useMoney()
  const { locale, num, date, t } = useLocale()

  if (tool.render.kind === "chart") {
    const days = tool.render.days
    const series = data.series.slice(90 - days, 90).map((point) => ({
      label: date(point.date, { day: "numeric", month: "short" }),
      value:
        tool.render.kind === "chart" && tool.render.series === "occupancy"
          ? point.occupancy
          : tool.render.kind === "chart" && tool.render.series === "adr"
            ? point.adr
            : point.rooms + point.fnb + point.spa + point.events + point.other,
    }))
    const isOccupancy =
      tool.render.kind === "chart" && tool.render.series === "occupancy"

    return (
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {isOccupancy ? (
            <AreaChart
              data={series}
              margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={34}
              />
              <Tooltip content={<MiniTooltip suffix="%" />} cursor={false} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                strokeWidth={1.6}
                fill="url(#tcGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={series}
              margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={34}
                tickFormatter={(value: number) => money.compact(value)}
              />
              <Tooltip content={<MiniTooltip money />} cursor={false} />
              <Bar
                dataKey="value"
                fill="var(--chart-1)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  if (tool.render.kind === "metric") {
    const kpi = data.kpis.find((k) => k.id === "adr") ?? data.kpis[0]
    const aiHandled = data.conversations.filter(
      (c) => c.state === "aiHandled"
    ).length
    const isAi = tool.render.labelKey === "inbox.aiHandled"
    const value = isAi
      ? Math.round((aiHandled / data.conversations.length) * 100)
      : Math.round(kpi.value * 1.084)

    return (
      <div className="flex items-baseline gap-2">
        <span className="figure text-2xl">
          {isAi ? `${num(value)}%` : money.format(value)}
        </span>
        <StatusTag hue="green">
          +{num(tool.render.delta, { maximumFractionDigits: 1 })}%
        </StatusTag>
        <span className="text-[0.625rem] text-muted-foreground">
          {t("common.vsLastPeriod")}
        </span>
      </div>
    )
  }

  if (tool.render.kind === "availability") {
    const nights = tool.render.nights
    const rooms = data.rooms
      .filter((room) => room.housekeeping !== "outOfService")
      .slice(0, 5)
    const typeRate = new Map(
      data.roomTypes.map((type) => [type.id, type.baseRate])
    )

    return (
      <div className="space-y-1">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center gap-2 rounded-md bg-card px-2 py-1.5 ring-1 ring-foreground/[0.06]"
          >
            <span className="nums text-[0.6875rem] font-medium">
              {num(Number(room.number), { useGrouping: false })}
            </span>
            <span className="text-[0.625rem] text-muted-foreground">
              {t(`rooms.types.${room.typeId}` as never)}
            </span>
            <span className="text-[0.625rem] text-muted-foreground">
              · {room.view[locale]}
            </span>
            <span className="nums ml-auto text-[0.6875rem] font-medium">
              {money.format((typeRate.get(room.typeId) ?? 0) * nights)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const columns = tool.render.columns
  const rows = tool.render.rows.length
    ? tool.render.rows
    : data.companies
        .slice()
        .sort((a, b) => b.roomNights - a.roomNights)
        .slice(0, 6)
        .map((company) => [
          company.name,
          num(company.roomNights),
          money.compact(company.accountValue),
          company.roomNights > 1200 ? "▲" : "▼",
        ])

  return (
    <div className="overflow-hidden rounded-md ring-1 ring-foreground/[0.06]">
      <table className="w-full text-[0.625rem]">
        <thead>
          <tr className="bg-muted/60">
            {columns.map((column, i) => (
              <th
                key={i}
                className={cn(
                  "px-2 py-1 text-left font-medium text-muted-foreground",
                  i > 0 && "text-right"
                )}
              >
                {column[locale]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[var(--hairline)]">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-2 py-1",
                    j > 0 && "nums text-right tabular-nums"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MiniTooltip({
  active,
  payload,
  label,
  suffix,
  money: isMoney,
}: {
  active?: boolean
  payload?: { value: number; name?: string; color?: string }[]
  label?: string
  suffix?: string
  money?: boolean
}) {
  const money = useMoney()
  const { num } = useLocale()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md bg-popover px-2 py-1 text-[0.625rem] shadow-md ring-1 ring-foreground/10">
      <div className="text-muted-foreground">{label}</div>
      {payload.map((entry, i) => (
        <div
          key={i}
          className="nums font-medium"
          style={{ color: entry.color }}
        >
          {isMoney
            ? money.format(entry.value)
            : `${num(entry.value, { maximumFractionDigits: 1 })}${suffix ?? ""}`}
        </div>
      ))}
    </div>
  )
}
