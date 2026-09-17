"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Car, ParkingSquare, ShieldCheck, TriangleAlert } from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import { CLEARANCE_HUE, CLEARANCE_LABEL, isEscalated } from "@/lib/vms"
import type { Vehicle } from "@/lib/types"

const FILTERS = ["all", "onSite", "reserved", "unscreened"] as const

export default function VehiclesPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, time } = useLocale()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(() => {
    switch (filter) {
      case "onSite":
        return data.vehicles.filter((vehicle) => !vehicle.exitAt)
      case "reserved":
        return data.vehicles.filter((vehicle) => isEscalated(vehicle.clearance))
      case "unscreened":
        return data.vehicles.filter((vehicle) => !vehicle.screened)
      default:
        return data.vehicles
    }
  }, [data.vehicles, filter])

  const columns = React.useMemo<ColumnDef<Vehicle, unknown>[]>(
    () => [
      {
        id: "plate",
        accessorFn: (row) => row.plate.en,
        header: t("vms.vehicles.plate"),
        cell: ({ row }) => (
          <span className="nums flex items-center gap-1.5 font-medium">
            <Car className="size-3 text-muted-foreground" />
            {row.original.plate[locale]}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: t("vms.luggage.kind"),
        cell: ({ row }) => (
          <StatusTag hue="slate">
            {t(`vms.vehicles.types.${row.original.type}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "make",
        header: t("vms.vehicles.make"),
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5">
            <span className="truncate">{row.original.make}</span>
            <span className="truncate text-[0.625rem] text-muted-foreground">
              {row.original.colour[locale]}
            </span>
          </span>
        ),
      },
      {
        id: "driver",
        accessorFn: (row) => row.driver[locale],
        header: t("vms.vehicles.driver"),
        cell: ({ row }) => {
          const visitor = row.original.visitorId
            ? lookups.visitor.get(row.original.visitorId)
            : undefined
          return (
            <span className="flex items-center gap-2">
              <Avatar
                name={row.original.driver[locale]}
                seed={visitor?.photoSeed}
                size={22}
              />
              <span className="min-w-0">
                <span className="block truncate">
                  {row.original.driver[locale]}
                </span>
                {visitor ? (
                  <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                    {visitor.badge}
                  </span>
                ) : null}
              </span>
            </span>
          )
        },
      },
      {
        accessorKey: "clearance",
        header: t("vms.clearance.title"),
        cell: ({ row }) => (
          <StatusTag
            hue={CLEARANCE_HUE[row.original.clearance]}
            dot={row.original.clearance !== "standard"}
          >
            {t(CLEARANCE_LABEL[row.original.clearance])}
          </StatusTag>
        ),
      },
      {
        accessorKey: "bay",
        header: t("vms.vehicles.bay"),
        cell: ({ row }) =>
          row.original.bay ? (
            <span
              className={cn(
                "nums flex items-center gap-1.5",
                isEscalated(row.original.clearance) && "font-medium text-primary"
              )}
            >
              <ParkingSquare className="size-3" />
              {row.original.bay}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t("vms.vehicles.unassigned")}
            </span>
          ),
      },
      {
        accessorKey: "screened",
        header: t("vms.luggage.screened"),
        cell: ({ row }) =>
          row.original.screened ? (
            <StatusTag hue="green" dot>
              <ShieldCheck className="size-2" />
            </StatusTag>
          ) : (
            <StatusTag hue="rose" dot>
              <TriangleAlert className="size-2" />
            </StatusTag>
          ),
      },
      {
        accessorKey: "entryAt",
        header: t("vms.vehicles.entry"),
        meta: { align: "right" },
        cell: ({ row }) => time(row.original.entryAt),
      },
      {
        accessorKey: "exitAt",
        header: t("vms.vehicles.exit"),
        meta: { align: "right" },
        cell: ({ row }) =>
          row.original.exitAt ? (
            time(row.original.exitAt)
          ) : (
            <StatusTag hue="green" dot>
              {t("vms.vehicles.onProperty")}
            </StatusTag>
          ),
      },
    ],
    [lookups, locale, t, time]
  )

  const kpis = React.useMemo(() => {
    const onSite = data.vehicles.filter((vehicle) => !vehicle.exitAt).length
    const reserved = data.vehicles.filter((vehicle) =>
      isEscalated(vehicle.clearance)
    ).length
    const unscreened = data.vehicles.filter((vehicle) => !vehicle.screened).length
    return [
      {
        id: "total",
        label: t("vms.vehicles.title"),
        value: data.vehicles.length,
        color: CHART_COLORS[0],
      },
      {
        id: "onSite",
        label: t("vms.vehicles.onProperty"),
        value: onSite,
        color: CHART_COLORS[5],
      },
      {
        id: "reserved",
        label: t("vms.perks.reservedBay"),
        value: reserved,
        color: CHART_COLORS[2],
      },
      {
        id: "unscreened",
        label: t("vms.luggage.unscreened"),
        value: unscreened,
        color: CHART_COLORS[4],
      },
    ]
  }, [data.vehicles, t])

  /** Occupancy of the two basement decks plus the reserved forecourt bays. */
  const parking = React.useMemo(() => {
    const occupied = new Set(
      data.vehicles.filter((v) => !v.exitAt && v.bay).map((v) => v.bay!)
    )
    const decks = [
      { id: "P", label: t("vms.perks.reservedBay"), size: 6 },
      { id: "B1", label: "B1", size: 42 },
      { id: "B2", label: "B2", size: 42 },
    ]
    return decks.map((deck) => ({
      ...deck,
      bays: Array.from({ length: deck.size }, (_, i) => {
        const code =
          deck.id === "P"
            ? `P${i + 1}`
            : `${deck.id}-${String(i + 1).padStart(2, "0")}`
        return { code, taken: occupied.has(code) }
      }),
    }))
  }, [data.vehicles, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("vms.vehicles.title")} subtitle={t("vms.title")} />

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />

        <Panel title={t("vms.vehicles.bay")} delay={0.05}>
          <div className="flex flex-wrap gap-4 pt-1">
            {parking.map((deck) => (
              <div key={deck.id} className="min-w-0">
                <div className="micro pb-1.5">{deck.label}</div>
                <div className="flex max-w-[22rem] flex-wrap gap-1">
                  {deck.bays.map((bay) => (
                    <span
                      key={bay.code}
                      title={bay.code}
                      className={cn(
                        "h-4 w-5 rounded-[3px] transition-colors",
                        bay.taken
                          ? deck.id === "P"
                            ? "bg-primary"
                            : "bg-[color-mix(in_oklch,var(--chart-1)_60%,transparent)]"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-end gap-3 pb-1">
              <Legend tone="var(--primary)" label={t("vms.perks.reservedBay")} />
              <Legend
                tone="color-mix(in oklch, var(--chart-1) 60%, transparent)"
                label={t("vms.vehicles.onProperty")}
              />
              <Legend tone="var(--muted)" label={t("vms.vehicles.unassigned")} />
            </div>
          </div>
        </Panel>

        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Car />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "onSite", label: t("vms.vehicles.onProperty") },
                  { value: "reserved", label: t("vms.clearance.escalated") },
                  { value: "unscreened", label: t("vms.luggage.unscreened") },
                ]}
              />
              <TableSearch value={query} onChange={setQuery} className="ml-auto" />
            </>
          }
        />
      </div>
    </div>
  )
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-[3px]" style={{ background: tone }} />
      <span className="text-[0.625rem] text-muted-foreground">{label}</span>
    </span>
  )
}
