"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Car, IdCard, LogOut, ShieldCheck, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import { CLEARANCE_HUE, CLEARANCE_LABEL, isEscalated } from "@/lib/vms"
import type { TagHue, Visitor, VisitorPurpose } from "@/lib/types"

const PURPOSE_HUE: Record<VisitorPurpose, TagHue> = {
  meeting: "blue",
  delivery: "amber",
  contractor: "purple",
  interview: "teal",
  event: "magenta",
  personal: "slate",
}

export default function VisitorLogPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, time, dateTime } = useLocale()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<Visitor, unknown>[]>(
    () => [
      {
        accessorKey: "badge",
        header: t("visitors.badge"),
        cell: ({ row }) => (
          <span className="nums text-muted-foreground">
            {row.original.badge}
          </span>
        ),
      },
      {
        id: "name",
        accessorFn: (row) => row.name[locale],
        header: t("common.name"),
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <Avatar name={row.original.name[locale]} size={22} />
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {row.original.name[locale]}
              </span>
              <span className="block truncate text-[0.625rem] text-muted-foreground">
                {row.original.company[locale]}
              </span>
            </span>
          </span>
        ),
      },
      {
        accessorKey: "purpose",
        header: t("visitors.purpose"),
        cell: ({ row }) => (
          <StatusTag hue={PURPOSE_HUE[row.original.purpose]}>
            {t(`visitors.purposes.${row.original.purpose}` as never)}
          </StatusTag>
        ),
      },
      {
        id: "host",
        accessorFn: (row) =>
          lookups.staff.get(row.hostStaffId)?.name[locale] ?? "",
        header: t("visitors.visiting"),
        cell: ({ row }) => (
          <span className="truncate text-muted-foreground">
            {lookups.staff.get(row.original.hostStaffId)?.name[locale]}
          </span>
        ),
      },
      {
        id: "clearance",
        accessorFn: (row) => row.clearance,
        header: t("vms.clearance.title"),
        cell: ({ row }) => (
          <span className="flex items-center gap-1">
            <StatusTag hue={CLEARANCE_HUE[row.original.clearance]} dot>
              {t(CLEARANCE_LABEL[row.original.clearance])}
            </StatusTag>
            {row.original.escortRequired ? (
              <StatusTag hue="slate">
                <ShieldCheck className="size-2" />
              </StatusTag>
            ) : null}
          </span>
        ),
      },
      {
        id: "vehicle",
        accessorFn: (row) =>
          row.vehicleId ? (lookups.vehicle.get(row.vehicleId)?.plate.en ?? "") : "",
        header: t("visitors.vehicle"),
        cell: ({ row }) => {
          const vehicle = row.original.vehicleId
            ? lookups.vehicle.get(row.original.vehicleId)
            : undefined
          return vehicle ? (
            <span className="nums flex items-center gap-1.5 text-[0.625rem] text-muted-foreground">
              <Car className="size-3" />
              {vehicle.plate[locale]}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        },
      },
      {
        accessorKey: "checkedInAt",
        header: t("visitors.checkedInAt"),
        meta: { align: "right" },
        cell: ({ row }) => dateTime(row.original.checkedInAt),
      },
      {
        accessorKey: "checkedOutAt",
        header: t("visitors.checkedOutAt"),
        meta: { align: "right" },
        cell: ({ row }) =>
          row.original.checkedOutAt ? (
            time(row.original.checkedOutAt)
          ) : (
            <StatusTag hue="green" dot>
              {t("common.live")}
            </StatusTag>
          ),
      },
    ],
    [lookups, locale, t, time, dateTime]
  )

  const kpis = React.useMemo(() => {
    const inside = data.visitors.filter((v) => !v.checkedOutAt)
    return [
      {
        id: "today",
        label: t("common.today"),
        value: data.visitors.length,
        color: CHART_COLORS[0],
      },
      {
        id: "inside",
        label: t("dashboard.inHouse"),
        value: inside.length,
        color: CHART_COLORS[5],
      },
      {
        id: "vehicles",
        label: t("visitors.vehicle"),
        value: data.visitors.filter((v) => v.vehicleId).length,
        color: CHART_COLORS[3],
      },
      {
        id: "escalated",
        label: t("vms.clearance.escalated"),
        value: data.visitors.filter((v) => isEscalated(v.clearance)).length,
        color: CHART_COLORS[2],
      },
    ]
  }, [data.visitors, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("visitors.log")}
        subtitle={t("nav.groups.resources")}
      >
        <Button variant="outline" size="sm">
          <LogOut />
          {t("frontDesk.checkOut")}
        </Button>
        <Button size="sm">
          <UserPlus />
          {t("visitors.issuePass")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.visitors}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<IdCard />}
          className="min-h-0 flex-1"
          toolbar={
            <TableSearch
              value={query}
              onChange={setQuery}
              className="ml-auto"
            />
          }
        />
      </div>
    </div>
  )
}
