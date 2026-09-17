"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { UtensilsCrossed } from "lucide-react"

import { MiniTooltip } from "@/components/ai/tool-call-card"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { Meter } from "@/components/motion/waveform"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { Bilingual } from "@/lib/types"

const OUTLETS: {
  id: string
  name: Bilingual
  covers: number
  foodCost: number
}[] = [
  {
    id: "padma",
    name: { en: "Padma — all day dining", bn: "পদ্মা — সারাদিনের রেস্তোরাঁ" },
    covers: 186,
    foodCost: 0.31,
  },
  {
    id: "rooftop",
    name: { en: "Rooftop grill", bn: "রুফটপ গ্রিল" },
    covers: 94,
    foodCost: 0.38,
  },
  {
    id: "lobby",
    name: { en: "Lobby lounge", bn: "লবি লাউঞ্জ" },
    covers: 132,
    foodCost: 0.22,
  },
  {
    id: "banquet",
    name: { en: "Banquet & events", bn: "ভোজসভা ও অনুষ্ঠান" },
    covers: 320,
    foodCost: 0.27,
  },
  {
    id: "room",
    name: { en: "In-room dining", bn: "কক্ষে খাবার" },
    covers: 58,
    foodCost: 0.34,
  },
]

export default function FnbPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, locale, num, pct } = useLocale()

  const window = data.series.slice(60, 90)
  const rows = React.useMemo(
    () =>
      OUTLETS.map((outlet, index) => ({
        ...outlet,
        label: outlet.name[locale],
        revenue: Math.round(
          window.reduce((sum, point) => sum + point.fnb, 0) *
            (outlet.covers / OUTLETS.reduce((sum, o) => sum + o.covers, 0))
        ),
        color: CHART_COLORS[index],
      })),
    [window, locale]
  )

  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0)
  const totalCovers = rows.reduce((sum, row) => sum + row.covers, 0)

  const kpis = [
    {
      id: "revenue",
      label: t("finance.revenue"),
      value: totalRevenue,
      prefix: money.symbol,
      format: { notation: "compact" as const, maximumFractionDigits: 1 },
      color: CHART_COLORS[0],
    },
    {
      id: "covers",
      label: t("inventory.covers"),
      value: totalCovers,
      color: CHART_COLORS[1],
    },
    {
      id: "avg",
      label: t("inventory.avgCheck"),
      value: Math.round(totalRevenue / totalCovers / 30),
      prefix: money.symbol,
      color: CHART_COLORS[3],
    },
    {
      id: "foodCost",
      label: t("inventory.foodCost"),
      value: 29.4,
      suffix: "%",
      format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      delta: -1.8,
      color: CHART_COLORS[5],
    },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.fnb")}
        subtitle={t("inventory.outlets")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        <KpiStrip cells={kpis} />
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <Panel title={t("inventory.outlets")}>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rows}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="var(--hairline)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={40}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(value) => money.compact(Number(value))}
                  />
                  <Tooltip content={<MiniTooltip money />} cursor={false} />
                  <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                    {rows.map((row) => (
                      <Cell key={row.id} fill={row.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title={t("inventory.foodCost")} delay={0.05}>
            <div className="flex flex-col gap-3 pt-1">
              {rows.map((row) => (
                <div key={row.id}>
                  <div className="flex items-center gap-2 pb-1.5">
                    <UtensilsCrossed className="size-3 text-muted-foreground" />
                    <span className="truncate text-[0.6875rem]">{row.label}</span>
                    <StatusTag hue="slate" className="ml-auto">
                      {num(row.covers)}
                    </StatusTag>
                  </div>
                  <Meter
                    value={row.foodCost}
                    tone={row.foodCost > 0.35 ? "warning" : "success"}
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
