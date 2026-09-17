"use client"

import * as React from "react"
import { motion } from "motion/react"

import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS, HUE_VAR } from "@/lib/hue"
import type { HousekeepingState } from "@/lib/types"

const STATE_TOKEN: Record<HousekeepingState, string> = {
  clean: "var(--success)",
  dirty: "var(--warning)",
  inspected: "var(--primary)",
  outOfService: "var(--destructive)",
}

export default function RoomStatusPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num } = useLocale()
  const [filter, setFilter] = React.useState<"all" | HousekeepingState>("all")

  const rooms = React.useMemo(
    () =>
      filter === "all"
        ? data.rooms
        : data.rooms.filter((room) => room.housekeeping === filter),
    [data.rooms, filter]
  )

  const byFloor = React.useMemo(() => {
    const map = new Map<number, typeof rooms>()
    for (const room of rooms) {
      map.set(room.floor, [...(map.get(room.floor) ?? []), room])
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [rooms])

  const kpis = React.useMemo(() => {
    const count = (state: HousekeepingState) =>
      data.rooms.filter((room) => room.housekeeping === state).length
    return [
      {
        id: "clean",
        label: t("rooms.clean"),
        value: count("clean"),
        color: CHART_COLORS[5],
      },
      {
        id: "dirty",
        label: t("rooms.dirty"),
        value: count("dirty"),
        color: CHART_COLORS[3],
      },
      {
        id: "inspected",
        label: t("rooms.inspected"),
        value: count("inspected"),
        color: CHART_COLORS[0],
      },
      {
        id: "oos",
        label: t("rooms.outOfService"),
        value: count("outOfService"),
        color: CHART_COLORS[4],
      },
    ]
  }, [data.rooms, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("nav.roomStatus")}
        subtitle={t("nav.groups.operations")}
      >
        <SegmentedPills
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("common.all") },
            { value: "clean", label: t("rooms.clean") },
            { value: "dirty", label: t("rooms.dirty") },
            { value: "inspected", label: t("rooms.inspected") },
            { value: "outOfService", label: t("rooms.outOfService") },
          ]}
        />
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <Panel
          title={t("rooms.allRooms")}
          className="min-h-0"
          bodyClassName="min-h-0 px-0"
        >
          <ScrollFade className="h-full px-4">
            {byFloor.map(([floor, floorRooms]) => (
              <div key={floor} className="mb-4">
                <div className="micro pb-2">
                  {t("common.room")} {num(floor)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {floorRooms.map((room, index) => (
                    <motion.button
                      key={room.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(index, 24) * 0.008 }}
                      title={`${room.number} · ${room.view[locale]}`}
                      className={cn(
                        "group relative flex h-14 w-[70px] flex-col justify-between rounded-lg p-1.5 text-left ring-1 transition-colors",
                        room.occupied ? "bg-card" : "bg-surface",
                        "ring-foreground/[0.07] hover:ring-foreground/20"
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: STATE_TOKEN[room.housekeeping] }}
                        />
                        <span className="nums text-[0.6875rem] font-medium">
                          {num(Number(room.number), { useGrouping: false })}
                        </span>
                      </span>
                      <span
                        className="h-1 rounded-full"
                        style={{
                          background: `color-mix(in oklch, ${HUE_VAR[lookups.roomType.get(room.typeId)?.hue ?? "slate"]} 45%, transparent)`,
                        }}
                      />
                      <span className="text-[0.5625rem] text-muted-foreground">
                        {room.occupied
                          ? t("rooms.occupied")
                          : t("rooms.vacant")}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {(["clean", "dirty", "inspected", "outOfService"] as const).map(
                (state) => (
                  <StatusTag
                    key={state}
                    hue={
                      state === "clean"
                        ? "green"
                        : state === "dirty"
                          ? "amber"
                          : state === "inspected"
                            ? "blue"
                            : "rose"
                    }
                    dot
                  >
                    {t(`rooms.${state}` as never)}
                  </StatusTag>
                )
              )}
            </div>
          </ScrollFade>
        </Panel>
      </div>
    </div>
  )
}
