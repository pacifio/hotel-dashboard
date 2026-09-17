"use client"

import * as React from "react"
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { MiniTooltip } from "@/components/ai/tool-call-card"
import { useLocale } from "@/lib/i18n/provider"
import { useDataset } from "@/lib/data"
import { demoToday, isoDay } from "@/lib/demo-time"

/**
 * Actual occupancy to date, then the forecast with a widening confidence band.
 * The band is drawn as a stacked pair of areas so it reads as uncertainty
 * rather than as two extra series.
 */
export function OccupancyChart({
  back = 45,
  forward = 45,
  height = 200,
}: {
  back?: number
  forward?: number
  height?: number
}) {
  const data = useDataset()
  const { date, num } = useLocale()
  const today = React.useMemo(() => isoDay(demoToday()), [])

  const rows = React.useMemo(() => {
    const slice = data.series.slice(90 - back, 90 + forward + 1)
    return slice.map((point) => ({
      date: point.date,
      label: date(point.date, { day: "numeric", month: "short" }),
      actual: point.forecast === undefined ? point.occupancy : null,
      forecast:
        point.forecast ?? (point.date === today ? point.occupancy : null),
      bandBase: point.lower ?? null,
      bandSpan:
        point.lower !== undefined && point.upper !== undefined
          ? point.upper - point.lower
          : null,
    }))
  }, [data.series, back, forward, date, today])

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={rows}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="occArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={38}
          />
          <YAxis
            domain={[20, 100]}
            ticks={[20, 40, 60, 80, 100]}
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={38}
            tickFormatter={(value) => `${num(Number(value))}%`}
          />
          <Tooltip
            content={<MiniTooltip suffix="%" />}
            cursor={{ stroke: "var(--border)" }}
          />
          <Area
            dataKey="bandBase"
            stackId="band"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            dataKey="bandSpan"
            stackId="band"
            stroke="none"
            fill="var(--chart-3)"
            fillOpacity={0.14}
            isAnimationActive={false}
          />
          <Area
            dataKey="actual"
            stroke="var(--chart-1)"
            strokeWidth={1.8}
            fill="url(#occArea)"
            connectNulls
          />
          <Line
            dataKey="forecast"
            stroke="var(--chart-3)"
            strokeWidth={1.8}
            strokeDasharray="3 3"
            dot={false}
            connectNulls
          />
          <ReferenceLine
            x={date(today, { day: "numeric", month: "short" })}
            stroke="var(--scrubber)"
            strokeWidth={1}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
