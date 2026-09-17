"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  Car,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { EmptyState, Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { TableSearch } from "@/components/motion/data-table"
import { cn } from "@/lib/utils"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { useMounted } from "@/hooks/use-mounted"
import { CHART_COLORS } from "@/lib/hue"
import { demoNow } from "@/lib/demo-time"
import { CLEARANCE_HUE, CLEARANCE_LABEL, dwellMinutes } from "@/lib/vms"
import type { GateId } from "@/lib/types"

type Filter = "all" | "in" | "out" | "flagged"

const GATES: (GateId | "all")[] = [
  "all",
  "mainLobby",
  "porte",
  "service",
  "basement",
  "banquet",
  "staff",
]

export default function MovementsPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, time, dateTime, duration } = useLocale()
  const mounted = useMounted()

  const [filter, setFilter] = React.useState<Filter>("all")
  const [gate, setGate] = React.useState<GateId | "all">("all")
  const [query, setQuery] = React.useState("")

  const now = demoNow()

  const movements = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return data.movements.filter((movement) => {
      if (filter === "in" && movement.direction !== "in") return false
      if (filter === "out" && movement.direction !== "out") return false
      if (filter === "flagged" && !movement.flag) return false
      if (gate !== "all" && movement.gate !== gate) return false
      if (!normalized) return true
      const visitor = lookups.visitor.get(movement.visitorId)
      return (
        visitor?.name.en.toLowerCase().includes(normalized) ||
        visitor?.name.bn.includes(normalized) ||
        visitor?.badge.toLowerCase().includes(normalized)
      )
    })
  }, [data.movements, filter, gate, query, lookups])

  const kpis = React.useMemo(() => {
    const onSite = data.visitors.filter((v) => !v.checkedOutAt)
    const dwell = data.visitors
      .filter((v) => v.checkedOutAt)
      .map((v) => dwellMinutes(v.checkedInAt, v.checkedOutAt, now))
    return [
      {
        id: "in",
        label: t("vms.incoming"),
        value: data.movements.filter((m) => m.direction === "in").length,
        color: CHART_COLORS[5],
      },
      {
        id: "out",
        label: t("vms.outgoing"),
        value: data.movements.filter((m) => m.direction === "out").length,
        color: CHART_COLORS[3],
      },
      {
        id: "onSite",
        label: t("vms.onSite"),
        value: onSite.length,
        color: CHART_COLORS[0],
      },
      {
        id: "dwell",
        label: t("vms.avgDwell"),
        value: dwell.length
          ? Math.round(dwell.reduce((sum, m) => sum + m, 0) / dwell.length)
          : 0,
        suffix: locale === "bn" ? " মি" : "m",
        color: CHART_COLORS[1],
      },
    ]
  }, [data.movements, data.visitors, now, t, locale])

  /** Hourly in/out counts give the feed a shape without needing a chart lib. */
  const hourly = React.useMemo(() => {
    const buckets = Array.from({ length: 24 }, () => ({ in: 0, out: 0 }))
    for (const movement of data.movements) {
      const hour = new Date(movement.at).getUTCHours()
      buckets[hour][movement.direction] += 1
    }
    const peak = Math.max(1, ...buckets.map((b) => Math.max(b.in, b.out)))
    return { buckets, peak }
  }, [data.movements])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("vms.movements")} subtitle={t("vms.title")}>
        <select
          value={gate}
          onChange={(event) => setGate(event.target.value as GateId | "all")}
          className="h-7 rounded-full border border-border bg-card px-2.5 text-[0.6875rem] outline-none focus-visible:border-ring"
        >
          {GATES.map((id) => (
            <option key={id} value={id}>
              {id === "all" ? t("vms.allGates") : t(`vms.gates.${id}` as never)}
            </option>
          ))}
        </select>
        <TableSearch value={query} onChange={setQuery} />
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1fr_17rem]">
          <Panel
            title={t("vms.movements")}
            className="min-h-0"
            bodyClassName="min-h-0 px-0 flex flex-col"
            actions={
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "in", label: t("vms.incoming") },
                  { value: "out", label: t("vms.outgoing") },
                  {
                    value: "flagged",
                    label: t("vms.flagged"),
                    count: num(data.movements.filter((m) => m.flag).length),
                  },
                ]}
              />
            }
          >
            <ScrollFade className="min-h-0 flex-1 px-3">
              {movements.slice(0, 120).map((movement, index) => {
                const visitor = lookups.visitor.get(movement.visitorId)
                const operator = lookups.staff.get(movement.operatorStaffId)
                const vehicle = movement.vehicleId
                  ? lookups.vehicle.get(movement.vehicleId)
                  : undefined
                const incoming = movement.direction === "in"

                return (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index, 18) * 0.015 }}
                    className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full",
                        incoming
                          ? "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {incoming ? (
                        <ArrowDownLeft className="size-3" />
                      ) : (
                        <ArrowUpRight className="size-3" />
                      )}
                    </span>

                    <Avatar
                      name={visitor?.name[locale] ?? "—"}
                      seed={visitor?.photoSeed}
                      size={24}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[0.6875rem] font-medium">
                          {visitor?.name[locale]}
                        </span>
                        <StatusTag
                          hue={CLEARANCE_HUE[movement.clearance]}
                          dot={movement.clearance !== "standard"}
                        >
                          {t(CLEARANCE_LABEL[movement.clearance])}
                        </StatusTag>
                      </div>
                      <div className="nums flex items-center gap-2 text-[0.625rem] text-muted-foreground">
                        <span className="truncate">{visitor?.badge}</span>
                        <span className="truncate">
                          {t(`vms.gates.${movement.gate}` as never)}
                        </span>
                        <span className="truncate">
                          {t(`vms.methods.${movement.method}` as never)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {movement.luggageCount > 0 ? (
                        <StatusTag hue="teal">
                          <Briefcase className="size-2" />
                          {num(movement.luggageCount)}
                        </StatusTag>
                      ) : null}
                      {vehicle ? (
                        <StatusTag hue="blue">
                          <Car className="size-2" />
                        </StatusTag>
                      ) : null}
                      {movement.flag ? (
                        <StatusTag hue="rose" dot>
                          <TriangleAlert className="size-2" />
                        </StatusTag>
                      ) : null}
                    </div>

                    <div className="w-24 shrink-0 text-right">
                      <div
                        className="nums truncate text-[0.6875rem]"
                        title={dateTime(movement.at)}
                      >
                        {time(movement.at)}
                      </div>
                      <div className="truncate text-[0.5625rem] text-muted-foreground">
                        {operator?.name[locale]}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {movements.length === 0 ? (
                <EmptyState
                  icon={<ShieldAlert />}
                  title={t("common.noResults")}
                  hint={t("common.noResultsHint")}
                />
              ) : null}
            </ScrollFade>
          </Panel>

          <div className="flex min-h-0 flex-col gap-3">
            <Panel title={t("vms.movements")} subtitle={t("common.today")} delay={0.05}>
              <div className="flex h-24 items-end gap-[2px] pt-1">
                {hourly.buckets.map((bucket, hour) => (
                  <span key={hour} className="flex flex-1 flex-col justify-end gap-px">
                    <motion.span
                      initial={{ height: 0 }}
                      animate={{
                        height: `${(bucket.in / hourly.peak) * 44}px`,
                      }}
                      transition={{ delay: hour * 0.01, duration: 0.3 }}
                      className="rounded-t-[2px] bg-[var(--success)]"
                    />
                    <motion.span
                      initial={{ height: 0 }}
                      animate={{
                        height: `${(bucket.out / hourly.peak) * 44}px`,
                      }}
                      transition={{ delay: hour * 0.01, duration: 0.3 }}
                      className="rounded-b-[2px] bg-[var(--chart-8)]"
                    />
                  </span>
                ))}
              </div>
              <div className="nums flex justify-between pt-1.5 text-[0.5625rem] text-muted-foreground">
                <span>{num(0)}</span>
                <span>{num(12)}</span>
                <span>{num(23)}</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Legend tone="var(--success)" label={t("vms.incoming")} />
                <Legend tone="var(--chart-8)" label={t("vms.outgoing")} />
              </div>
            </Panel>

            <Panel
              title={
                <span className="flex items-center gap-1.5">
                  <TriangleAlert className="size-3 text-[var(--warning)]" />
                  {t("vms.flagged")}
                </span>
              }
              className="min-h-0"
              bodyClassName="min-h-0"
              delay={0.1}
            >
              <ScrollFade className="max-h-[16rem]">
                <div className="flex flex-col gap-1.5">
                  {data.movements
                    .filter((movement) => movement.flag)
                    .slice(0, 10)
                    .map((movement) => {
                      const visitor = lookups.visitor.get(movement.visitorId)
                      return (
                        <div
                          key={movement.id}
                          className="rounded-lg bg-surface p-2.5"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-[0.6875rem] font-medium">
                              {visitor?.name[locale]}
                            </span>
                            <span className="nums ml-auto shrink-0 text-[0.5625rem] text-muted-foreground">
                              {mounted ? time(movement.at) : null}
                            </span>
                          </div>
                          <p className="mt-1 text-[0.625rem] leading-relaxed text-muted-foreground">
                            {movement.flag?.[locale]}
                          </p>
                        </div>
                      )
                    })}
                  {data.movements.every((movement) => !movement.flag) ? (
                    <p className="py-6 text-center text-[0.625rem] text-muted-foreground">
                      {t("vms.noFlags")}
                    </p>
                  ) : null}
                </div>
              </ScrollFade>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-[3px]" style={{ background: tone }} />
      <span className="text-[0.625rem] text-muted-foreground">{label}</span>
    </span>
  )
}
