"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  Area,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { RotateCcw, Sparkles, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MiniTooltip } from "@/components/ai/tool-call-card"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { StreamingText } from "@/components/motion/streaming-text"
import { useDataset, useMoney, useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { demoToday, isoDay } from "@/lib/demo-time"
import { CHART_COLORS } from "@/lib/hue"

type Scenario = "conservative" | "baseline" | "optimistic"

const SCENARIO_BIAS: Record<Scenario, number> = {
  conservative: -6,
  baseline: 0,
  optimistic: 7,
}

const DRIVERS = [
  {
    id: "rate",
    labelKey: "ai.rateAdjustment",
    min: -20,
    max: 25,
    unit: "%",
    weight: -0.42,
  },
  {
    id: "marketing",
    labelKey: "ai.marketingSpend",
    min: -50,
    max: 100,
    unit: "%",
    weight: 0.11,
  },
  {
    id: "seasonality",
    labelKey: "ai.seasonality",
    min: -15,
    max: 15,
    unit: "%",
    weight: 0.55,
  },
  {
    id: "competitor",
    labelKey: "ai.competitorRate",
    min: -20,
    max: 20,
    unit: "%",
    weight: 0.33,
  },
] as const

type DriverId = (typeof DRIVERS)[number]["id"]

export default function ForecastPage() {
  const data = useDataset()
  const tenant = useTenant()
  const money = useMoney()
  const { t, locale, num, date, pct } = useLocale()

  const [scenario, setScenario] = React.useState<Scenario>("baseline")
  const [drivers, setDrivers] = React.useState<Record<DriverId, number>>({
    rate: 0,
    marketing: 0,
    seasonality: 0,
    competitor: 0,
  })

  /** The whole forecast is a pure function of the sliders, so the curve, the
   *  KPIs and the narrative all move together. */
  const occupancyShift = React.useMemo(() => {
    const fromDrivers = DRIVERS.reduce(
      (sum, driver) => sum + drivers[driver.id] * driver.weight * 0.1,
      0
    )
    return fromDrivers + SCENARIO_BIAS[scenario]
  }, [drivers, scenario])

  const rateShift = drivers.rate / 100

  const rows = React.useMemo(() => {
    const today = isoDay(demoToday())
    return data.series.slice(60, 181).map((point) => {
      const isFuture = point.date > today
      const occupancy = isFuture
        ? Math.min(99, Math.max(25, point.occupancy + occupancyShift))
        : point.occupancy
      const adr = isFuture ? Math.round(point.adr * (1 + rateShift)) : point.adr
      const spread = isFuture ? 3 + Math.abs(occupancyShift) * 0.3 : 0
      const revenue = Math.round(
        (occupancy / 100) * tenant.roomCount * adr * (isFuture ? 1 : 1)
      )
      return {
        date: point.date,
        label: date(point.date, { day: "numeric", month: "short" }),
        actual: isFuture
          ? null
          : Math.round((point.occupancy / 100) * tenant.roomCount * point.adr),
        forecast: isFuture ? revenue : null,
        bandBase: isFuture ? Math.round(revenue * (1 - spread / 100)) : null,
        bandSpan: isFuture ? Math.round(revenue * ((spread * 2) / 100)) : null,
        occupancy,
        adr,
      }
    })
  }, [data.series, occupancyShift, rateShift, tenant.roomCount, date])

  const future = rows.filter((row) => row.forecast !== null)
  const projected = future.reduce((sum, row) => sum + (row.forecast ?? 0), 0)
  const baselineProjected = React.useMemo(() => {
    const today = isoDay(demoToday())
    return data.series
      .slice(60, 181)
      .filter((point) => point.date > today)
      .reduce(
        (sum, point) =>
          sum +
          Math.round((point.occupancy / 100) * tenant.roomCount * point.adr),
        0
      )
  }, [data.series, tenant.roomCount])

  const delta = ((projected - baselineProjected) / baselineProjected) * 100
  const avgOccupancy =
    future.reduce((sum, row) => sum + row.occupancy, 0) / (future.length || 1)
  const avgAdr =
    future.reduce((sum, row) => sum + row.adr, 0) / (future.length || 1)

  const waterfall = React.useMemo(
    () =>
      DRIVERS.map((driver, index) => ({
        label: t(driver.labelKey),
        value: Math.round(
          baselineProjected * (drivers[driver.id] * driver.weight * 0.001)
        ),
        color: CHART_COLORS[index],
      })),
    [drivers, baselineProjected, t]
  )

  const anomalies = React.useMemo(
    () =>
      future
        .map((row, index) => ({ row, index }))
        .filter(({ index }) => index === 12 || index === 38 || index === 61)
        .map(({ row }, i) => ({
          id: row.date,
          date: row.label,
          hue: (["amber", "rose", "blue"] as const)[i],
          title:
            i === 0
              ? {
                  en: "Demand spike — city marathon",
                  bn: "চাহিদার উল্লম্ফন — নগর ম্যারাথন",
                }
              : i === 1
                ? { en: "Group block releases", bn: "গ্রুপ ব্লক ছাড়া হচ্ছে" }
                : {
                    en: "Comp-set undercut detected",
                    bn: "প্রতিযোগীর ভাড়া কমানো শনাক্ত",
                  },
          body:
            i === 0
              ? {
                  en: "Three comp-set hotels already at 100%. Raising rate 12% on this night is low risk.",
                  bn: "প্রতিযোগী তিনটি হোটেল ইতিমধ্যে ১০০% পূর্ণ। এই রাতে ভাড়া ১২% বাড়ানো কম ঝুঁকিপূর্ণ।",
                }
              : i === 1
                ? {
                    en: "42 rooms return to general inventory with 9 days to sell. Historically 61% resell.",
                    bn: "৯ দিন হাতে রেখে ৪২টি কক্ষ সাধারণ ইনভেন্টরিতে ফিরছে। অতীতে ৬১% পুনরায় বিক্রি হয়েছে।",
                  }
                : {
                    en: "Two nearby properties dropped 8% overnight. Holding rate costs about 14 room nights.",
                    bn: "কাছের দুটি হোটেল রাতারাতি ৮% ভাড়া কমিয়েছে। ভাড়া অপরিবর্তিত রাখলে প্রায় ১৪টি কক্ষ-রাত হারাতে হবে।",
                  },
        })),
    [future]
  )

  const narrativeKey = `${scenario}-${drivers.rate}-${drivers.marketing}-${drivers.seasonality}-${drivers.competitor}`
  const narrative =
    locale === "bn"
      ? `এই পরিস্থিতিতে আগামী ৯০ দিনে প্রক্ষেপিত রাজস্ব ${money.compact(projected)}, ভিত্তিরেখার তুলনায় ${num(Math.abs(delta), { maximumFractionDigits: 1 })}% ${delta >= 0 ? "বেশি" : "কম"}। গড় অকুপেন্সি দাঁড়াচ্ছে ${num(avgOccupancy, { maximumFractionDigits: 1 })}% এবং গড় দৈনিক ভাড়া ${money.format(Math.round(avgAdr))}। ${drivers.rate > 0 ? "ভাড়া বাড়ানোর ফলে চাহিদায় কিছুটা চাপ পড়ছে, তবে প্রতি কক্ষে আয় বাড়ছে।" : drivers.rate < 0 ? "ভাড়া কমানোয় অকুপেন্সি বাড়লেও প্রতি কক্ষে আয় কমছে — সতর্ক থাকুন।" : "ভাড়া অপরিবর্তিত, তাই পরিবর্তনটি পুরোটাই চাহিদার দিক থেকে আসছে।"} মূল অনিশ্চয়তা সপ্তাহের মাঝামাঝি রাতগুলোতে, যেখানে আস্থার পরিসর সবচেয়ে চওড়া।`
      : `Under this scenario the next 90 days project ${money.compact(projected)} in revenue, ${num(Math.abs(delta), { maximumFractionDigits: 1 })}% ${delta >= 0 ? "above" : "below"} baseline. Average occupancy settles at ${num(avgOccupancy, { maximumFractionDigits: 1 })}% on an ADR of ${money.format(Math.round(avgAdr))}. ${drivers.rate > 0 ? "The rate increase is costing you some demand, but revenue per available room still comes out ahead." : drivers.rate < 0 ? "Discounting lifts occupancy but erodes revenue per available room — watch that trade." : "Rate is unchanged, so the entire movement here is demand-side."} The widest uncertainty sits on midweek nights, where the confidence band is broadest.`

  const kpis = [
    {
      id: "projected",
      label: t("ai.projectedRevenue"),
      value: projected,
      delta,
      prefix: money.symbol,
      format: { notation: "compact" as const, maximumFractionDigits: 1 },
      color: CHART_COLORS[0],
    },
    {
      id: "occupancy",
      label: t("dashboard.occupancy"),
      value: Number(avgOccupancy.toFixed(1)),
      suffix: "%",
      format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      color: CHART_COLORS[1],
    },
    {
      id: "adr",
      label: t("dashboard.adr"),
      value: Math.round(avgAdr),
      prefix: money.symbol,
      delta: drivers.rate,
      color: CHART_COLORS[2],
    },
    {
      id: "revpar",
      label: t("dashboard.revpar"),
      value: Math.round((avgOccupancy / 100) * avgAdr),
      prefix: money.symbol,
      color: CHART_COLORS[3],
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader title={t("ai.forecast")} subtitle={t("ai.forecastSubtitle")}>
        <SegmentedPills
          size="sm"
          value={scenario}
          onChange={setScenario}
          options={[
            { value: "conservative", label: t("ai.conservative") },
            { value: "baseline", label: t("ai.baseline") },
            { value: "optimistic", label: t("ai.optimistic") },
          ]}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setScenario("baseline")
            setDrivers({ rate: 0, marketing: 0, seasonality: 0, competitor: 0 })
          }}
        >
          <RotateCcw />
          {t("common.reset")}
        </Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          <Panel
            title={t("ai.projectedRevenue")}
            subtitle={`${t("ai.confidenceBand")} · ${t("ai.scenario")}: ${t(`ai.${scenario}`)}`}
          >
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={rows}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="fcArea" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.3}
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
                    minTickGap={44}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                    tickFormatter={(value) => money.compact(Number(value))}
                  />
                  <Tooltip
                    content={<MiniTooltip money />}
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
                    fillOpacity={0.16}
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="actual"
                    stroke="var(--chart-1)"
                    strokeWidth={1.6}
                    fill="url(#fcArea)"
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
                    x={date(demoToday(), { day: "numeric", month: "short" })}
                    stroke="var(--scrubber)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title={t("ai.drivers")} delay={0.05}>
            <div className="flex flex-col gap-4 pt-1">
              {DRIVERS.map((driver) => (
                <div key={driver.id}>
                  <div className="flex items-baseline justify-between pb-2">
                    <span className="text-[0.6875rem] text-muted-foreground">
                      {t(driver.labelKey)}
                    </span>
                    <span className="nums text-[0.6875rem] font-medium">
                      {drivers[driver.id] > 0 ? "+" : ""}
                      {num(drivers[driver.id])}
                      {driver.unit}
                    </span>
                  </div>
                  <Slider
                    value={[drivers[driver.id]]}
                    min={driver.min}
                    max={driver.max}
                    step={1}
                    onValueChange={(value) =>
                      setDrivers((prev) => ({
                        ...prev,
                        [driver.id]: Array.isArray(value) ? value[0] : value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <Panel
            title={t("ai.drivers")}
            subtitle={t("finance.byDepartment")}
            delay={0.1}
          >
            <div className="h-[168px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={waterfall}
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
                    width={104}
                  />
                  <Tooltip content={<MiniTooltip money />} cursor={false} />
                  <Bar dataKey="value" radius={3}>
                    {waterfall.map((entry) => (
                      <Cell
                        key={entry.label}
                        fill={
                          entry.value >= 0
                            ? "var(--success)"
                            : "var(--destructive)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title={
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3 text-primary" />
                {t("ai.narrative")}
              </span>
            }
            delay={0.15}
          >
            <p className="pt-1 text-xs leading-relaxed">
              <StreamingText
                key={narrativeKey}
                text={narrative}
                charsPerTick={6}
                minDelay={5}
                maxDelay={14}
                cursor={false}
              />
            </p>
          </Panel>
        </div>

        <Panel
          title={
            <span className="flex items-center gap-1.5">
              <TriangleAlert className="size-3 text-[var(--warning)]" />
              {t("ai.anomalies")}
            </span>
          }
          delay={0.2}
        >
          <div className="grid gap-2 pt-1 sm:grid-cols-3">
            {anomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.08 }}
                className="rounded-lg bg-surface p-3 ring-1 ring-foreground/[0.06]"
              >
                <div className="flex items-center gap-2">
                  <StatusTag hue={anomaly.hue} dot>
                    {anomaly.date}
                  </StatusTag>
                </div>
                <h4 className="mt-2 text-[0.6875rem] font-medium">
                  {anomaly.title[locale]}
                </h4>
                <p className="mt-1 text-[0.6875rem] leading-relaxed text-muted-foreground">
                  {anomaly.body[locale]}
                </p>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </ScrollFade>
  )
}
