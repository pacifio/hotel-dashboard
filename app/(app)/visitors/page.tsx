"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Car,
  Crown,
  ShieldCheck,
  TriangleAlert,
  Video,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { CameraTile } from "@/components/vms/camera-tile"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS, HUE_VAR } from "@/lib/hue"
import { demoToday } from "@/lib/demo-time"
import {
  CLEARANCE_HUE,
  CLEARANCE_LABEL,
  isEscalated,
  isOverstaying,
  overstayMinutes,
} from "@/lib/vms"
import type { GateId } from "@/lib/types"

/** Overstay reads as "+2h 15m" rather than a clock duration. */
function overstayLabel(
  minutes: number,
  num: (value: number) => string,
  locale: "en" | "bn"
) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const h = locale === "bn" ? "ঘ" : "h"
  const m = locale === "bn" ? "মি" : "m"
  return hours > 0 ? `${num(hours)}${h} ${num(rest)}${m}` : `${num(rest)}${m}`
}

const GATES: GateId[] = [
  "mainLobby",
  "porte",
  "banquet",
  "service",
  "basement",
  "staff",
]

export default function VmsOverviewPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, time } = useLocale()

  const now = React.useMemo(() => demoToday().getTime() + 10 * 3600_000, [])

  const onSite = React.useMemo(
    () => data.visitors.filter((visitor) => !visitor.checkedOutAt),
    [data.visitors]
  )

  const overstaying = React.useMemo(
    () =>
      onSite.filter((visitor) =>
        isOverstaying(visitor.expectedOutAt, visitor.checkedOutAt, now)
      ),
    [onSite, now]
  )

  const escalatedOnSite = React.useMemo(
    () => onSite.filter((visitor) => isEscalated(visitor.clearance)),
    [onSite]
  )

  const kpis = React.useMemo(
    () => [
      {
        id: "onSite",
        label: t("vms.onSite"),
        value: onSite.length,
        color: CHART_COLORS[0],
      },
      {
        id: "escalated",
        label: t("vms.clearance.escalated"),
        value: escalatedOnSite.length,
        color: CHART_COLORS[2],
      },
      {
        id: "vehicles",
        label: t("vms.vehicles.onProperty"),
        value: data.vehicles.filter((vehicle) => !vehicle.exitAt).length,
        color: CHART_COLORS[1],
      },
      {
        id: "luggage",
        label: t("vms.luggage.states.leftLuggage"),
        value: data.luggage.filter((item) => item.state === "leftLuggage")
          .length,
        color: CHART_COLORS[5],
      },
    ],
    [onSite, escalatedOnSite, data.vehicles, data.luggage, t]
  )

  /** Live head-count per gate, from the movements that have no matching exit. */
  const gateLoad = React.useMemo(() => {
    const counts = new Map<GateId, number>()
    for (const visitor of onSite) {
      counts.set(visitor.gate, (counts.get(visitor.gate) ?? 0) + 1)
    }
    const peak = Math.max(1, ...GATES.map((gate) => counts.get(gate) ?? 0))
    return GATES.map((gate) => ({
      gate,
      count: counts.get(gate) ?? 0,
      share: (counts.get(gate) ?? 0) / peak,
    }))
  }, [onSite])

  const recent = React.useMemo(
    () => data.movements.slice(0, 8),
    [data.movements]
  )
  const wallCameras = React.useMemo(
    () => data.cameras.filter((camera) => camera.gate).slice(0, 4),
    [data.cameras]
  )

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader title={t("vms.title")} subtitle={t("vms.overview")}>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/visitors/cctv" />}
        >
          <Video />
          {t("vms.cctv.wall")}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/visitors/gate-pass" />}
        >
          <ShieldCheck />
          {t("visitors.issuePass")}
        </Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <Panel
            title={t("vms.movements")}
            subtitle={t("vms.onSite")}
            onExpand={() => {}}
          >
            <div className="flex flex-col pt-1">
              {recent.map((movement, index) => {
                const visitor = lookups.visitor.get(movement.visitorId)
                const incoming = movement.direction === "in"
                return (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full",
                        incoming
                          ? "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {incoming ? (
                        <ArrowDownLeft className="size-2.5" />
                      ) : (
                        <ArrowUpRight className="size-2.5" />
                      )}
                    </span>
                    <Avatar
                      name={visitor?.name[locale] ?? "—"}
                      seed={visitor?.photoSeed}
                      size={22}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.6875rem] font-medium">
                        {visitor?.name[locale]}
                      </div>
                      <div className="truncate text-[0.625rem] text-muted-foreground">
                        {t(`vms.gates.${movement.gate}` as never)} ·{" "}
                        {t(`vms.methods.${movement.method}` as never)}
                      </div>
                    </div>
                    {movement.luggageCount > 0 ? (
                      <StatusTag hue="teal">
                        <Briefcase className="size-2" />
                        {num(movement.luggageCount)}
                      </StatusTag>
                    ) : null}
                    {movement.vehicleId ? (
                      <StatusTag hue="blue">
                        <Car className="size-2" />
                      </StatusTag>
                    ) : null}
                    <span className="nums shrink-0 text-[0.625rem] whitespace-nowrap text-muted-foreground">
                      {time(movement.at)}
                    </span>
                  </motion.div>
                )
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-center"
              nativeButton={false}
              render={<Link href="/visitors/movements" />}
            >
              {t("common.viewAll")}
              <ArrowRight />
            </Button>
          </Panel>

          <div className="grid gap-3">
            <Panel
              title={t("vms.gate")}
              subtitle={t("vms.onSite")}
              delay={0.05}
            >
              <div className="flex flex-col gap-2 pt-1">
                {gateLoad.map((entry) => (
                  <div key={entry.gate} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 truncate text-[0.6875rem] text-muted-foreground">
                      {t(`vms.gates.${entry.gate}` as never)}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.share * 100}%` }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="block h-full rounded-full bg-primary"
                      />
                    </span>
                    <span className="nums w-6 shrink-0 text-right text-[0.6875rem]">
                      {num(entry.count)}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              title={
                <span className="flex items-center gap-1.5">
                  <TriangleAlert className="size-3 text-[var(--warning)]" />
                  {t("vms.overstaying")}
                </span>
              }
              delay={0.1}
            >
              <div className="flex flex-col gap-1 pt-1">
                {overstaying.slice(0, 5).map((visitor) => (
                  <div
                    key={visitor.id}
                    className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5"
                  >
                    <Avatar
                      name={visitor.name[locale]}
                      seed={visitor.photoSeed}
                      size={20}
                    />
                    <span className="min-w-0 flex-1 truncate text-[0.6875rem]">
                      {visitor.name[locale]}
                    </span>
                    <span className="nums shrink-0 text-[0.625rem] text-[var(--warning)]">
                      +
                      {overstayLabel(
                        overstayMinutes(
                          visitor.expectedOutAt,
                          visitor.checkedOutAt,
                          now
                        ),
                        num,
                        locale
                      )}
                    </span>
                  </div>
                ))}
                {overstaying.length === 0 ? (
                  <p className="py-4 text-center text-[0.625rem] text-muted-foreground">
                    {t("vms.noFlags")}
                  </p>
                ) : null}
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1.35fr]">
          <Panel
            title={
              <span className="flex items-center gap-1.5">
                <Crown className="size-3 text-[var(--warning)]" />
                {t("vms.clearance.escalated")}
              </span>
            }
            subtitle={t("vms.onSite")}
            delay={0.15}
          >
            <div className="flex flex-col gap-1 pt-1">
              {escalatedOnSite.slice(0, 6).map((visitor) => (
                <Link
                  key={visitor.id}
                  href="/visitors/clearance"
                  className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5 transition-colors hover:bg-muted"
                >
                  <span className="relative shrink-0">
                    <Avatar
                      name={visitor.name[locale]}
                      seed={visitor.photoSeed}
                      size={24}
                    />
                    <span
                      className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-surface"
                      style={{
                        background: HUE_VAR[CLEARANCE_HUE[visitor.clearance]],
                      }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.6875rem] font-medium">
                      {visitor.name[locale]}
                    </span>
                    <span className="block truncate text-[0.625rem] text-muted-foreground">
                      {visitor.company[locale]}
                    </span>
                  </span>
                  <StatusTag hue={CLEARANCE_HUE[visitor.clearance]} dot>
                    {t(CLEARANCE_LABEL[visitor.clearance])}
                  </StatusTag>
                </Link>
              ))}
              {escalatedOnSite.length === 0 ? (
                <p className="py-4 text-center text-[0.625rem] text-muted-foreground">
                  {t("common.none")}
                </p>
              ) : null}
            </div>
          </Panel>

          <Panel
            title={
              <span className="flex items-center gap-1.5">
                <Video className="size-3 text-muted-foreground" />
                {t("vms.cctv.wall")}
              </span>
            }
            subtitle={t("vms.cctv.demoNotice")}
            onExpand={() => {}}
            delay={0.2}
          >
            <div className="grid grid-cols-2 gap-2 pt-1">
              {wallCameras.map((camera) => (
                <CameraTile key={camera.id} camera={camera} dense />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-center"
              nativeButton={false}
              render={<Link href="/visitors/cctv" />}
            >
              {t("common.viewAll")}
              <ArrowRight />
            </Button>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
