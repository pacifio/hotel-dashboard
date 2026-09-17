"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Star, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { StaffDepartment, StaffMember, TagHue } from "@/lib/types"

const DEPT_HUE: Record<StaffDepartment, TagHue> = {
  frontOffice: "blue",
  housekeeping: "purple",
  fnb: "amber",
  engineering: "teal",
  security: "slate",
  sales: "green",
  finance: "magenta",
  hr: "rose",
}

export default function StaffDirectoryPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, locale, num, dec, date } = useLocale()
  const [query, setQuery] = React.useState("")
  const [shift, setShift] = React.useState<
    "all" | "morning" | "evening" | "night"
  >("all")

  const rows = React.useMemo(
    () =>
      shift === "all"
        ? data.staff
        : data.staff.filter((s) => s.shift === shift),
    [data.staff, shift]
  )

  const columns = React.useMemo<ColumnDef<StaffMember, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name[locale],
        header: t("common.name"),
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <Avatar
              name={row.original.name[locale]}
              seed={row.original.avatarSeed}
              size={24}
            />
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {row.original.name[locale]}
              </span>
              <span className="block truncate text-[0.625rem] text-muted-foreground">
                {row.original.role[locale]}
              </span>
            </span>
          </span>
        ),
      },
      {
        accessorKey: "department",
        header: t("staff.department"),
        cell: ({ row }) => (
          <StatusTag hue={DEPT_HUE[row.original.department]}>
            {t(`staff.departments.${row.original.department}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "shift",
        header: t("staff.shift"),
        cell: ({ row }) => (
          <StatusTag hue="slate" dot>
            {t(`staff.shifts.${row.original.shift}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "phone",
        header: t("common.phone"),
        cell: ({ row }) => (
          <span className="nums text-muted-foreground">
            {row.original.phone}
          </span>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: t("common.date"),
        meta: { align: "right" },
        cell: ({ row }) =>
          date(row.original.joinedAt, { month: "short", year: "numeric" }),
      },
      {
        accessorKey: "rating",
        header: t("reports.guestSatisfaction"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="flex items-center justify-end gap-1">
            <Star className="size-2.5 fill-[var(--warning)] text-[var(--warning)]" />
            {dec(row.original.rating, 1)}
          </span>
        ),
      },
      {
        accessorKey: "salary",
        header: t("staff.grossPay"),
        meta: { align: "right" },
        cell: ({ row }) => money.format(row.original.salary),
      },
    ],
    [locale, t, dec, date, money]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("staff.directory")}
        subtitle={`${num(data.staff.length)} ${t("staff.title").toLowerCase()}`}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<UserCog />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={shift}
                onChange={setShift}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "morning", label: t("staff.shifts.morning") },
                  { value: "evening", label: t("staff.shifts.evening") },
                  { value: "night", label: t("staff.shifts.night") },
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
