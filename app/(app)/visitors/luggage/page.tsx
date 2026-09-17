"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Briefcase, ScanLine, ShieldCheck, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import { CLEARANCE_HUE, CLEARANCE_LABEL } from "@/lib/vms"
import type { LuggageItem, LuggageState, TagHue } from "@/lib/types"

const STATE_HUE: Record<LuggageState, TagHue> = {
  withVisitor: "blue",
  leftLuggage: "teal",
  screening: "amber",
  held: "rose",
  released: "slate",
}

const FILTERS = [
  "all",
  "withVisitor",
  "leftLuggage",
  "screening",
  "held",
] as const

export default function LuggagePage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, dec, time } = useLocale()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.luggage
        : data.luggage.filter((item) => item.state === filter),
    [data.luggage, filter]
  )

  const columns = React.useMemo<ColumnDef<LuggageItem, unknown>[]>(
    () => [
      {
        accessorKey: "tag",
        header: t("vms.luggage.tag"),
        cell: ({ row }) => (
          <span className="nums flex items-center gap-1.5 font-medium">
            <Briefcase className="size-3 text-muted-foreground" />
            {row.original.tag}
          </span>
        ),
      },
      {
        id: "owner",
        accessorFn: (row) =>
          lookups.visitor.get(row.visitorId)?.name[locale] ?? "",
        header: t("vms.luggage.owner"),
        cell: ({ row }) => {
          const visitor = lookups.visitor.get(row.original.visitorId)
          if (!visitor) return <span className="text-muted-foreground">—</span>
          return (
            <span className="flex items-center gap-2">
              <Avatar
                name={visitor.name[locale]}
                seed={visitor.photoSeed}
                size={22}
              />
              <span className="min-w-0">
                <span className="block truncate">{visitor.name[locale]}</span>
                <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                  {visitor.badge}
                </span>
              </span>
            </span>
          )
        },
      },
      {
        id: "clearance",
        accessorFn: (row) =>
          lookups.visitor.get(row.visitorId)?.clearance ?? "standard",
        header: t("vms.clearance.title"),
        cell: ({ row }) => {
          const visitor = lookups.visitor.get(row.original.visitorId)
          if (!visitor) return null
          return (
            <StatusTag hue={CLEARANCE_HUE[visitor.clearance]} dot>
              {t(CLEARANCE_LABEL[visitor.clearance])}
            </StatusTag>
          )
        },
      },
      {
        accessorKey: "kind",
        header: t("vms.luggage.kind"),
        cell: ({ row }) => (
          <StatusTag hue="slate">
            {t(`vms.luggage.kinds.${row.original.kind}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "weightKg",
        header: t("vms.luggage.weight"),
        meta: { align: "right" },
        cell: ({ row }) => `${dec(row.original.weightKg, 1)} kg`,
      },
      {
        accessorKey: "screened",
        header: t("vms.luggage.screened"),
        cell: ({ row }) =>
          row.original.screened ? (
            <StatusTag hue="green" dot>
              <ShieldCheck className="size-2" />
              {t("vms.luggage.screened")}
            </StatusTag>
          ) : (
            <StatusTag hue="rose" dot>
              <TriangleAlert className="size-2" />
              {t("vms.luggage.unscreened")}
            </StatusTag>
          ),
      },
      {
        accessorKey: "state",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={STATE_HUE[row.original.state]}>
            {t(`vms.luggage.states.${row.original.state}` as never)}
          </StatusTag>
        ),
      },
      {
        id: "location",
        accessorFn: (row) => row.location[locale],
        header: t("vms.luggage.location"),
        cell: ({ row }) => (
          <span className="truncate text-muted-foreground">
            {row.original.location[locale]}
          </span>
        ),
      },
      {
        accessorKey: "checkedInAt",
        header: t("visitors.checkedInAt"),
        meta: { align: "right" },
        cell: ({ row }) => time(row.original.checkedInAt),
      },
    ],
    [lookups, locale, t, dec, time]
  )

  const kpis = React.useMemo(() => {
    const held = data.luggage.filter((item) => item.state === "held").length
    const unscreened = data.luggage.filter((item) => !item.screened).length
    const stored = data.luggage.filter(
      (item) => item.state === "leftLuggage"
    ).length
    return [
      {
        id: "pieces",
        label: t("vms.luggage.pieces"),
        value: data.luggage.length,
        color: CHART_COLORS[0],
      },
      {
        id: "stored",
        label: t("vms.luggage.states.leftLuggage"),
        value: stored,
        color: CHART_COLORS[1],
      },
      {
        id: "unscreened",
        label: t("vms.luggage.unscreened"),
        value: unscreened,
        color: CHART_COLORS[3],
      },
      {
        id: "held",
        label: t("vms.luggage.states.held"),
        value: held,
        color: CHART_COLORS[4],
      },
    ]
  }, [data.luggage, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("vms.luggage.title")} subtitle={t("vms.title")}>
        <Button variant="outline" size="sm">
          <ScanLine />
          {t("vms.luggage.screened")}
        </Button>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Briefcase />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={FILTERS.map((value) => ({
                  value,
                  label:
                    value === "all"
                      ? t("common.all")
                      : t(`vms.luggage.states.${value}` as never),
                }))}
              />
              <TableSearch value={query} onChange={setQuery} className="ml-auto" />
            </>
          }
        />
      </div>
    </div>
  )
}
