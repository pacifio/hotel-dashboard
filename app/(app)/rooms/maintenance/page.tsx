"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Wrench } from "lucide-react"

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
import type { TagHue, TaskPriority, TaskState, WorkOrder } from "@/lib/types"

const PRIORITY_HUE: Record<TaskPriority, TagHue> = {
  low: "slate",
  medium: "blue",
  high: "amber",
  critical: "rose",
}

const STATE_HUE: Record<TaskState, TagHue> = {
  unassigned: "slate",
  inProgress: "amber",
  completed: "green",
}

export default function MaintenancePage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, relative } = useLocale()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | TaskState>("all")

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.workOrders
        : data.workOrders.filter((order) => order.state === filter),
    [data.workOrders, filter]
  )

  const columns = React.useMemo<ColumnDef<WorkOrder, unknown>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("rooms.workOrder"),
        cell: ({ row }) => (
          <span className="nums font-medium">{row.original.number}</span>
        ),
      },
      {
        id: "issue",
        accessorFn: (row) => row.issue[locale],
        header: t("common.notes"),
        cell: ({ row }) => row.original.issue[locale],
      },
      {
        id: "area",
        accessorFn: (row) => row.area[locale],
        header: t("common.room"),
        cell: ({ row }) => {
          const room = row.original.roomId
            ? lookups.room.get(row.original.roomId)
            : undefined
          return (
            <span className="flex items-center gap-1.5">
              <StatusTag hue="slate">{row.original.area[locale]}</StatusTag>
              {room ? (
                <span className="nums text-[0.625rem] text-muted-foreground">
                  {num(Number(room.number), { useGrouping: false })}
                </span>
              ) : null}
            </span>
          )
        },
      },
      {
        accessorKey: "priority",
        header: t("rooms.priority"),
        cell: ({ row }) => (
          <StatusTag hue={PRIORITY_HUE[row.original.priority]} dot>
            {t(`common.${row.original.priority}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "state",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={STATE_HUE[row.original.state]}>
            {t(`rooms.${row.original.state}` as never)}
          </StatusTag>
        ),
      },
      {
        id: "reportedBy",
        accessorFn: (row) =>
          lookups.staff.get(row.reportedBy)?.name[locale] ?? "",
        header: t("rooms.reportedBy"),
        cell: ({ row }) => {
          const staff = lookups.staff.get(row.original.reportedBy)
          return staff ? (
            <span className="flex items-center gap-1.5">
              <Avatar
                name={staff.name[locale]}
                seed={staff.avatarSeed}
                size={20}
              />
              <span className="truncate">{staff.name[locale]}</span>
            </span>
          ) : null
        },
      },
      {
        accessorKey: "reportedAt",
        header: t("common.date"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {relative(row.original.reportedAt)}
          </span>
        ),
      },
    ],
    [lookups, locale, t, num, relative]
  )

  const kpis = React.useMemo(
    () => [
      {
        id: "open",
        label: t("rooms.workOrder"),
        value: data.workOrders.filter((o) => o.state !== "completed").length,
        color: CHART_COLORS[0],
      },
      {
        id: "critical",
        label: t("common.critical"),
        value: data.workOrders.filter((o) => o.priority === "critical").length,
        color: CHART_COLORS[4],
      },
      {
        id: "progress",
        label: t("rooms.inProgress"),
        value: data.workOrders.filter((o) => o.state === "inProgress").length,
        color: CHART_COLORS[3],
      },
      {
        id: "done",
        label: t("rooms.completed"),
        value: data.workOrders.filter((o) => o.state === "completed").length,
        color: CHART_COLORS[5],
      },
    ],
    [data.workOrders, t]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("rooms.maintenance")}
        subtitle={t("nav.groups.operations")}
      >
        <Button size="sm">
          <Plus />
          {t("rooms.workOrder")}
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
          emptyIcon={<Wrench />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "unassigned", label: t("rooms.unassigned") },
                  { value: "inProgress", label: t("rooms.inProgress") },
                  { value: "completed", label: t("rooms.completed") },
                ]}
              />
              <TableSearch
                value={query}
                onChange={setQuery}
                className="ml-auto"
              />
            </>
          }
        />
      </div>
    </div>
  )
}
