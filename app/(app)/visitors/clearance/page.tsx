"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  BadgeCheck,
  Briefcase,
  Car,
  Check,
  Crown,
  Info,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { EmptyState, Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS, HUE_VAR } from "@/lib/hue"
import { demoToday } from "@/lib/demo-time"
import {
  CLEARANCE_HUE,
  CLEARANCE_LABEL,
  CLEARANCE_PERKS,
  dwellMinutes,
  isEscalated,
  isOverstaying,
} from "@/lib/vms"
import type { ClearanceLevel } from "@/lib/types"

const LEVELS: ClearanceLevel[] = ["vip", "cip", "restricted", "standard"]

export default function ClearancePage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, time, duration } = useLocale()

  const [level, setLevel] = React.useState<ClearanceLevel | "escalated">(
    "escalated"
  )
  const [selectedId, setSelectedId] = React.useState<string>()

  const now = React.useMemo(() => demoToday().getTime() + 10 * 3600_000, [])

  const visitors = React.useMemo(() => {
    const list =
      level === "escalated"
        ? data.visitors.filter((visitor) => isEscalated(visitor.clearance))
        : data.visitors.filter((visitor) => visitor.clearance === level)
    // On-site first — that's who the desk actually has to handle.
    return list.sort((a, b) => {
      const onSite = Number(!!b.checkedOutAt) - Number(!!a.checkedOutAt)
      return onSite !== 0 ? onSite : b.checkedInAt.localeCompare(a.checkedInAt)
    })
  }, [data.visitors, level])

  React.useEffect(() => {
    setSelectedId(visitors[0]?.id)
  }, [visitors])

  const selected = visitors.find((visitor) => visitor.id === selectedId)
  const selectedVehicle = selected?.vehicleId
    ? lookups.vehicle.get(selected.vehicleId)
    : undefined
  const selectedBags = React.useMemo(
    () =>
      selected
        ? data.luggage.filter((item) => item.visitorId === selected.id)
        : [],
    [data.luggage, selected]
  )

  const kpis = React.useMemo(() => {
    const count = (id: ClearanceLevel) =>
      data.visitors.filter((visitor) => visitor.clearance === id).length
    const onSiteEscalated = data.visitors.filter(
      (visitor) => isEscalated(visitor.clearance) && !visitor.checkedOutAt
    ).length
    return [
      { id: "vip", label: t("vms.clearance.vip"), value: count("vip"), color: CHART_COLORS[3] },
      { id: "cip", label: t("vms.clearance.cip"), value: count("cip"), color: CHART_COLORS[2] },
      {
        id: "restricted",
        label: t("vms.clearance.restricted"),
        value: count("restricted"),
        color: CHART_COLORS[4],
      },
      {
        id: "onSite",
        label: t("vms.onSite"),
        value: onSiteEscalated,
        color: CHART_COLORS[0],
      },
    ]
  }, [data.visitors, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("vms.clearance.escalated")}
        subtitle={t("vms.title")}
      >
        <SegmentedPills
          size="sm"
          value={level}
          onChange={setLevel}
          options={[
            { value: "escalated", label: t("vms.clearance.escalated") },
            ...LEVELS.map((id) => ({
              value: id,
              label: t(CLEARANCE_LABEL[id]),
            })),
          ]}
        />
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />

        <div className="flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 ring-1 ring-foreground/[0.06]">
          <Info className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
          <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">
            {t("vms.clearance.cipNote")}
          </p>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1fr_20rem]">
          <Panel
            title={t("visitors.title")}
            subtitle={`${num(visitors.length)}`}
            className="min-h-0"
            bodyClassName="min-h-0 px-0"
          >
            <ScrollFade className="h-full px-2">
              {visitors.map((visitor) => {
                const host = lookups.staff.get(visitor.hostStaffId)
                const onSite = !visitor.checkedOutAt
                const overstay = isOverstaying(
                  visitor.expectedOutAt,
                  visitor.checkedOutAt,
                  now
                )
                return (
                  <button
                    key={visitor.id}
                    onClick={() => setSelectedId(visitor.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      visitor.id === selectedId
                        ? "bg-sidebar-accent"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <span className="relative shrink-0">
                      <Avatar
                        name={visitor.name[locale]}
                        seed={visitor.photoSeed}
                        size={28}
                      />
                      {onSite ? (
                        <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-[var(--success)] ring-2 ring-card" />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[0.6875rem] font-medium">
                          {visitor.name[locale]}
                        </span>
                        <StatusTag hue={CLEARANCE_HUE[visitor.clearance]} dot>
                          {t(CLEARANCE_LABEL[visitor.clearance])}
                        </StatusTag>
                        {visitor.escortRequired ? (
                          <StatusTag hue="slate">
                            <ShieldCheck className="size-2" />
                          </StatusTag>
                        ) : null}
                      </span>
                      <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                        {visitor.company[locale]} · {visitor.badge}
                      </span>
                    </span>

                    <span className="hidden w-28 shrink-0 truncate text-[0.625rem] text-muted-foreground sm:block">
                      {host?.name[locale]}
                    </span>

                    <span className="w-16 shrink-0 text-right">
                      {overstay ? (
                        <StatusTag hue="rose" dot>
                          {t("vms.overstay")}
                        </StatusTag>
                      ) : (
                        <span className="nums text-[0.625rem] text-muted-foreground">
                          {time(visitor.checkedInAt)}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}

              {visitors.length === 0 ? (
                <EmptyState
                  icon={<Crown />}
                  title={t("common.noResults")}
                  hint={t("common.noResultsHint")}
                />
              ) : null}
            </ScrollFade>
          </Panel>

          <div className="min-h-0">
            {selected ? (
              <Panel
                title={t("vms.clearance.entitlements")}
                className="h-full min-h-0"
                bodyClassName="min-h-0"
                delay={0.05}
              >
                <ScrollFade className="h-full">
                  <div className="flex flex-col items-center gap-2 pb-3">
                    <span className="relative">
                      <Avatar
                        name={selected.name[locale]}
                        seed={selected.photoSeed}
                        size={52}
                      />
                      <span
                        className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full ring-2 ring-card"
                        style={{
                          background: `color-mix(in oklch, ${HUE_VAR[CLEARANCE_HUE[selected.clearance]]} 22%, var(--card))`,
                          color: HUE_VAR[CLEARANCE_HUE[selected.clearance]],
                        }}
                      >
                        {selected.clearance === "restricted" ? (
                          <ShieldCheck className="size-3" />
                        ) : (
                          <Crown className="size-3" />
                        )}
                      </span>
                    </span>
                    <div className="text-center">
                      <div className="text-xs font-medium">
                        {selected.name[locale]}
                      </div>
                      <div className="text-[0.625rem] text-muted-foreground">
                        {selected.company[locale]}
                      </div>
                    </div>
                    <StatusTag hue={CLEARANCE_HUE[selected.clearance]} dot>
                      {t(CLEARANCE_LABEL[selected.clearance])}
                    </StatusTag>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Tile
                      label={t("vms.idDocument")}
                      value={t(`vms.ids.${selected.idType}` as never)}
                    />
                    <Tile label={t("vms.gate")} value={t(`vms.gates.${selected.gate}` as never)} />
                    <Tile
                      label={t("visitors.checkedInAt")}
                      value={time(selected.checkedInAt)}
                    />
                    <Tile
                      label={t("vms.expectedOut")}
                      value={
                        selected.expectedOutAt
                          ? time(selected.expectedOutAt)
                          : "—"
                      }
                    />
                  </div>

                  <div className="mt-3">
                    <div className="micro pb-1.5">
                      {t("vms.clearance.entitlements")}
                    </div>
                    {CLEARANCE_PERKS[selected.clearance].length ? (
                      <div className="flex flex-col gap-1">
                        {CLEARANCE_PERKS[selected.clearance].map((perk, index) => (
                          <motion.div
                            key={perk}
                            initial={{ opacity: 0, x: 4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.035 }}
                            className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5"
                          >
                            <Check className="size-3 shrink-0 text-[var(--success)]" />
                            <span className="truncate text-[0.6875rem]">
                              {t(perk)}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-md bg-surface px-2 py-2 text-[0.625rem] text-muted-foreground">
                        {selected.clearance === "restricted"
                          ? t("vms.escortRequired")
                          : t("common.none")}
                      </p>
                    )}
                  </div>

                  {selected.escortRequired ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-[color-mix(in_oklch,var(--warning)_10%,transparent)] px-2.5 py-2">
                      <UserRoundCheck className="size-3 shrink-0 text-[var(--warning)]" />
                      <span className="min-w-0 text-[0.625rem]">
                        <span className="block truncate font-medium">
                          {t("vms.escortRequired")}
                        </span>
                        <span className="block truncate text-muted-foreground">
                          {selected.escortStaffId
                            ? lookups.staff.get(selected.escortStaffId)?.name[
                                locale
                              ]
                            : "—"}
                        </span>
                      </span>
                    </div>
                  ) : null}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Tile
                      label={t("vms.luggage.pieces")}
                      value={num(selectedBags.length)}
                      icon={<Briefcase className="size-3" />}
                    />
                    <Tile
                      label={t("vms.vehicles.bay")}
                      value={selectedVehicle?.bay ?? t("vms.vehicles.unassigned")}
                      icon={<Car className="size-3" />}
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2">
                    <BadgeCheck className="size-3 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate text-[0.625rem] text-muted-foreground">
                      {t("vms.clearance.approvedBy")}{" "}
                      {lookups.staff.get(selected.hostStaffId)?.name[locale]}
                    </span>
                    <span className="nums shrink-0 text-[0.625rem]">
                      {duration(
                        dwellMinutes(
                          selected.checkedInAt,
                          selected.checkedOutAt,
                          now
                        ) * 60
                      )}
                    </span>
                  </div>
                </ScrollFade>
              </Panel>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function Tile({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg bg-surface p-2.5">
      <div className="micro flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="nums mt-1 truncate text-[0.6875rem] font-medium">
        {value}
      </div>
    </div>
  )
}
