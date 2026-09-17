"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowRight,
  CalendarPlus,
  Check,
  Download,
  DoorOpen,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CombChart } from "@/components/motion/comb-chart"
import { KpiStrip, DeltaPill } from "@/components/motion/kpi-strip"
import { NumberTicker } from "@/components/motion/number-ticker"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { StreamingText } from "@/components/motion/streaming-text"
import { Avatar } from "@/components/motion/avatar-stack"
import { OccupancyChart } from "@/components/charts/occupancy-chart"
import { ChannelMix } from "@/components/charts/channel-mix"
import { useDataset, useLookups, useMoney, useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS, HUE_VAR } from "@/lib/hue"
import { demoToday, isoDay } from "@/lib/demo-time"
import { computeKpis } from "@/lib/metrics"
import { rangeSeriesSlice, resolvePreset } from "@/lib/report-range"
import { useUi } from "@/lib/store"
import { cn } from "@/lib/utils"

const RANGES = ["7d", "30d", "90d"] as const
type Range = (typeof RANGES)[number]

const INSIGHT_KIND = {
  pricing: { en: "Pricing", bn: "মূল্য নির্ধারণ" },
  risk: { en: "Risk", bn: "ঝুঁকি" },
  opportunity: { en: "Opportunity", bn: "সুযোগ" },
  operations: { en: "Operations", bn: "পরিচালনা" },
} as const

export default function DashboardPage() {
  const data = useDataset()
  const tenant = useTenant()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, date, pct, relative } = useLocale()
  const reportRange = useUi((state) => state.reportRange)
  const setReportRange = useUi((state) => state.setReportRange)

  const today = React.useMemo(() => isoDay(demoToday()), [])

  // Every figure on this page reads the global range from the top bar.
  const window = React.useMemo(() => {
    const { start, end } = rangeSeriesSlice(reportRange)
    return data.series.slice(start, end)
  }, [data.series, reportRange])

  const streams = React.useMemo(() => {
    const keys = ["rooms", "fnb", "spa", "events"] as const
    return keys.map((key, index) => ({
      key,
      label: t(`dashboard.${key}` as never),
      total: window.reduce((sum, point) => sum + point[key], 0),
      values: window.map((point) => point[key]),
      color: CHART_COLORS[index],
    }))
  }, [window, t])

  const kpis = React.useMemo(() => {
    const { start, end } = rangeSeriesSlice(reportRange)
    return computeKpis(data.series, start, end)
  }, [data.series, reportRange])

  const kpiCells = React.useMemo(
    () =>
      kpis.map((kpi, index) => ({
        id: kpi.id,
        label: t(kpi.labelKey as never),
        value: kpi.value,
        delta: kpi.delta,
        prefix: kpi.format === "currency" ? money.symbol : undefined,
        suffix: kpi.format === "percent" ? "%" : undefined,
        format:
          kpi.format === "percent"
            ? { maximumFractionDigits: 1, minimumFractionDigits: 1 }
            : {
                notation:
                  kpi.value > 1_000_000
                    ? ("compact" as const)
                    : ("standard" as const),
              },
        spark: kpi.spark,
        color: CHART_COLORS[index],
      })),
    [kpis, t, money.symbol]
  )

  const glance = React.useMemo(() => {
    const arrivals = data.reservations.filter((r) => r.checkIn === today)
    const departures = data.reservations.filter((r) => r.checkOut === today)
    const inHouse = data.reservations.filter((r) => r.status === "checkedIn")
    const available =
      tenant.roomCount -
      inHouse.length -
      data.rooms.filter((r) => r.housekeeping === "outOfService").length
    return [
      {
        id: "arrivals",
        label: t("dashboard.arrivals"),
        value: arrivals.length,
        icon: DoorOpen,
        hue: "green" as const,
        href: "/front-desk",
      },
      {
        id: "departures",
        label: t("dashboard.departures"),
        value: departures.length,
        icon: LogOut,
        hue: "amber" as const,
        href: "/front-desk",
      },
      {
        id: "inHouse",
        label: t("dashboard.inHouse"),
        value: inHouse.length,
        icon: Users,
        hue: "blue" as const,
        href: "/rooms/status",
      },
      {
        id: "available",
        label: t("dashboard.available"),
        value: Math.max(0, available),
        icon: Check,
        hue: "teal" as const,
        href: "/rooms/rack",
      },
    ]
  }, [data.reservations, data.rooms, tenant.roomCount, today, t])

  const feed = React.useMemo(
    () =>
      data.conversations.slice(0, 7).map((conversation) => ({
        id: conversation.id,
        guest: lookups.guest.get(conversation.guestId)?.name[locale] ?? "—",
        text: conversation.subject[locale],
        at: conversation.updatedAt,
        state: conversation.state,
      })),
    [data.conversations, lookups, locale]
  )

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle", {
          property: tenant.name[locale],
          date: date(demoToday(), {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
        })}
      >
        <SegmentedPills
          size="sm"
          options={RANGES.map((value) => ({
            value,
            label: num(parseInt(value, 10)) + (locale === "bn" ? " দিন" : "d"),
          }))}
          value={reportRange.preset as Range}
          onChange={(value) => setReportRange(resolvePreset(value))}
        />
        <Button variant="outline" size="sm">
          <Download />
          {t("common.export")}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/bookings/new" />}
        >
          <CalendarPlus />
          {t("bookings.newBooking")}
        </Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpiCells} />

        {/* dashboard.jpg — the comb-chart revenue row */}
        <Panel
          title={t("dashboard.revenueStreams")}
          onFilter={() => {}}
          onExpand={() => {}}
        >
          <div className="grid gap-5 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            {streams.map((stream, index) => (
              <motion.div
                key={stream.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="min-w-0"
              >
                <div className="text-[0.6875rem] text-muted-foreground">
                  {stream.label}
                </div>
                <div className="figure mt-0.5 truncate text-lg">
                  {money.compact(stream.total)}
                </div>
                <CombChart
                  values={stream.values}
                  color={stream.color}
                  className="mt-2"
                />
              </motion.div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <Panel
            title={t("dashboard.occupancyTrend")}
            subtitle={`${t("dashboard.actual")} · ${t("dashboard.forecastBand")}`}
            onExpand={() => {}}
            delay={0.05}
          >
            <OccupancyChart />
          </Panel>

          <div className="grid gap-3">
            <Panel title={t("dashboard.todayAtAGlance")} delay={0.1}>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {glance.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex flex-col gap-1 rounded-lg bg-surface p-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5">
                      <item.icon
                        className="size-3"
                        style={{ color: HUE_VAR[item.hue] }}
                      />
                      <span className="truncate text-[0.625rem] text-muted-foreground">
                        {item.label}
                      </span>
                      <ArrowRight className="ml-auto size-2.5 opacity-0 transition-opacity group-hover:opacity-60" />
                    </span>
                    <span className="figure text-xl">
                      <NumberTicker value={item.value} />
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>

            <Panel title={t("dashboard.channelMix")} delay={0.15}>
              <div className="pt-2">
                <ChannelMix />
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <Panel
            title={
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3 text-primary" />
                {t("dashboard.aiInsights")}
              </span>
            }
            subtitle={t("dashboard.aiInsightsSubtitle", {
              time: num(4) + (locale === "bn" ? " মিনিট" : " min"),
            })}
            delay={0.2}
          >
            <div className="grid gap-2 pt-1 sm:grid-cols-2">
              {data.insights.map((insight, index) => (
                <motion.article
                  key={insight.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="flex flex-col gap-2 rounded-lg bg-surface p-3 ring-1 ring-foreground/[0.06]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <StatusTag hue={insight.hue} dot>
                      {INSIGHT_KIND[insight.kind][locale]}
                    </StatusTag>
                    {insight.impact !== 0 ? (
                      <DeltaPill
                        value={
                          insight.impact > 0
                            ? insight.confidence * 12
                            : -insight.confidence * 9
                        }
                      />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-medium">
                    {insight.title[locale]}
                  </h4>
                  <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">
                    <StreamingText
                      text={insight.body[locale]}
                      startDelay={400 + index * 900}
                      charsPerTick={4}
                      minDelay={6}
                      maxDelay={20}
                      cursor={false}
                    />
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-1">
                    <Button
                      size="xs"
                      onClick={() =>
                        toast.success(insight.action[locale], {
                          description: insight.title[locale],
                        })
                      }
                    >
                      {insight.action[locale]}
                    </Button>
                    <span className="nums text-[0.625rem] text-muted-foreground">
                      {pct(insight.confidence * 100, 0)}{" "}
                      {t("inbox.confidence").toLowerCase()}
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </Panel>

          <Panel
            title={t("dashboard.liveFeed")}
            subtitle={
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" />
                {t("common.live")}
              </span>
            }
            delay={0.25}
          >
            <div className="flex flex-col pt-1">
              {feed.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <Avatar name={item.guest} size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.6875rem] font-medium">
                      {item.guest}
                    </div>
                    <div className="truncate text-[0.625rem] text-muted-foreground">
                      {item.text}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      item.state === "aiHandled" && "bg-primary",
                      item.state === "needsHuman" && "bg-[var(--warning)]",
                      item.state === "resolved" && "bg-[var(--success)]"
                    )}
                  />
                  <span className="shrink-0 text-[0.625rem] whitespace-nowrap text-muted-foreground">
                    {relative(item.at)}
                  </span>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
