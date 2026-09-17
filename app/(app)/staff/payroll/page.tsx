"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, HandCoins } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import { demoToday } from "@/lib/demo-time"
import type { StaffMember } from "@/lib/types"

export default function PayrollPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, locale, num, date } = useLocale()
  const [query, setQuery] = React.useState("")

  const deduction = (member: StaffMember) => Math.round(member.salary * 0.12)

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
              size={22}
            />
            <span className="truncate font-medium">
              {row.original.name[locale]}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "department",
        header: t("staff.department"),
        cell: ({ row }) => (
          <StatusTag hue="slate">
            {t(`staff.departments.${row.original.department}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "salary",
        header: t("staff.grossPay"),
        meta: { align: "right" },
        cell: ({ row }) => money.format(row.original.salary),
      },
      {
        id: "deductions",
        accessorFn: (row) => deduction(row),
        header: t("staff.deductions"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            −{money.format(deduction(row.original))}
          </span>
        ),
      },
      {
        id: "net",
        accessorFn: (row) => row.salary - deduction(row),
        header: t("staff.netPay"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="font-medium">
            {money.format(row.original.salary - deduction(row.original))}
          </span>
        ),
      },
      {
        id: "status",
        header: t("common.status"),
        enableSorting: false,
        cell: () => (
          <StatusTag hue="green" dot>
            {t("finance.paid")}
          </StatusTag>
        ),
      },
    ],
    [locale, t, money]
  )

  const kpis = React.useMemo(() => {
    const gross = data.staff.reduce((sum, member) => sum + member.salary, 0)
    const deductions = data.staff.reduce(
      (sum, member) => sum + deduction(member),
      0
    )
    return [
      {
        id: "headcount",
        label: t("staff.title"),
        value: data.staff.length,
        color: CHART_COLORS[0],
      },
      {
        id: "gross",
        label: t("staff.grossPay"),
        value: gross,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[1],
      },
      {
        id: "deductions",
        label: t("staff.deductions"),
        value: deductions,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[3],
      },
      {
        id: "net",
        label: t("staff.netPay"),
        value: gross - deductions,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[5],
      },
    ]
  }, [data.staff, t, money.symbol])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("staff.payroll")}
        subtitle={`${t("staff.payPeriod")} · ${date(demoToday(), { month: "long", year: "numeric" })}`}
      >
        <Button variant="outline" size="sm">
          <Download />
          {t("common.export")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.staff}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<HandCoins />}
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
