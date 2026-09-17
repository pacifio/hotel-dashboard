"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { MiniTooltip } from "@/components/ai/tool-call-card"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { ChannelMix } from "@/components/charts/channel-mix"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"

const DEPARTMENTS = ["rooms", "fnb", "spa", "events", "other"] as const

export default function RevenuePage() {
  const data = useDataset()
  const money = useMoney()
  const { t, num, date } = useLocale()
  const [range, setRange] = React.useState<"30" | "60" | "90">("90")

  const days = Number(range)
  const window = React.useMemo(
    () => data.series.slice(90 - days, 90),
    [data.series, days]
  )

  const rows = React.useMemo(
    () =>
      window.map((point) => ({
        label: date(point.date, { day: "numeric", month: "short" }),
        rooms: point.rooms,
        fnb: point.fnb,
        spa: point.spa,
        events: point.events,
        other: point.other,
      })),
    [window, date]
  )

  const byDepartment = React.useMemo(
    () =>
      DEPARTMENTS.map((key, index) => ({
        key,
        label: t(`dashboard.${key}` as never),
        value: window.reduce((sum, point) => sum + point[key], 0),
        color: CHART_COLORS[index],
      })),
    [window, t]
  )

  const total = byDepartment.reduce((sum, entry) => sum + entry.value, 0)

  const kpis = React.useMemo(
    () => [
      {
        id: "total",
        label: t("finance.revenue"),
        value: total,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        delta: data.kpis[3].delta,
        color: CHART_COLORS[0],
      },
      ...byDepartment.slice(0, 3).map((entry) => ({
        id: entry.key,
        label: entry.label,
        value: entry.value,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: entry.color,
      })),
    ],
    [total, byDepartment, data.kpis, t, money.symbol]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("finance.revenue")}
        subtitle={t("finance.byDepartment")}
      >
        <SegmentedPills
          size="sm"
          value={range}
          onChange={setRange}
          options={(["30", "60", "90"] as const).map((value) => ({
            value,
            label: num(Number(value)),
          }))}
        />
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        <KpiStrip cells={kpis} />

        <Panel title={t("dashboard.revenueStreams")}>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rows}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--hairline)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(value) => money.compact(Number(value))}
                />
                <Tooltip
                  content={<MiniTooltip money />}
                  cursor={{ stroke: "var(--border)" }}
                />
                {DEPARTMENTS.map((key, index) => (
                  <Area
                    key={key}
                    dataKey={key}
                    stackId="rev"
                    stroke={CHART_COLORS[index]}
                    strokeWidth={1}
                    fill={CHART_COLORS[index]}
                    fillOpacity={0.22}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title={t("finance.byDepartment")} delay={0.05}>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byDepartment}
                  layout="vertical"
                  margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => money.compact(Number(value))}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={76}
                  />
                  <Tooltip content={<MiniTooltip money />} cursor={false} />
                  <Bar dataKey="value" radius={3}>
                    {byDepartment.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title={t("dashboard.channelMix")} delay={0.1}>
            <div className="pt-2">
              <ChannelMix />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
