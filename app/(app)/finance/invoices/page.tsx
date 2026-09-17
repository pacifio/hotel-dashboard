"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, Receipt, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { Invoice, InvoiceStatus, TagHue } from "@/lib/types"

const HUE: Record<InvoiceStatus, TagHue> = {
  paid: "green",
  due: "blue",
  overdue: "rose",
  partiallyPaid: "amber",
}

const FILTERS = ["all", "paid", "due", "overdue", "partiallyPaid"] as const

export default function InvoicesPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, date } = useLocale()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.invoices
        : data.invoices.filter((invoice) => invoice.status === filter),
    [data.invoices, filter]
  )

  const columns = React.useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("finance.invoiceNumber"),
        cell: ({ row }) => (
          <span className="nums font-medium">{row.original.number}</span>
        ),
      },
      {
        id: "guest",
        accessorFn: (row) => lookups.guest.get(row.guestId)?.name[locale] ?? "",
        header: t("common.guest"),
        cell: ({ row }) =>
          lookups.guest.get(row.original.guestId)?.name[locale],
      },
      {
        id: "company",
        accessorFn: (row) =>
          row.companyId ? (lookups.company.get(row.companyId)?.name ?? "") : "",
        header: t("crm.companies"),
        cell: ({ row }) => {
          const company = row.original.companyId
            ? lookups.company.get(row.original.companyId)
            : undefined
          return company ? (
            <StatusTag hue={company.hue}>{company.name}</StatusTag>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        },
      },
      {
        accessorKey: "issuedAt",
        header: t("finance.issued"),
        meta: { align: "right" },
        cell: ({ row }) => date(row.original.issuedAt),
      },
      {
        accessorKey: "dueAt",
        header: t("finance.due"),
        meta: { align: "right" },
        cell: ({ row }) => date(row.original.dueAt),
      },
      {
        accessorKey: "amount",
        header: t("common.amount"),
        meta: { align: "right" },
        cell: ({ row }) => money.format(row.original.amount),
      },
      {
        id: "outstanding",
        accessorFn: (row) => row.amount - row.paid,
        header: t("finance.outstanding"),
        meta: { align: "right" },
        cell: ({ row }) => {
          const outstanding = row.original.amount - row.original.paid
          return (
            <span
              className={outstanding > 0 ? "text-[var(--warning)]" : undefined}
            >
              {money.format(outstanding)}
            </span>
          )
        },
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.status]} dot>
            {t(`finance.${row.original.status}` as never)}
          </StatusTag>
        ),
      },
    ],
    [lookups, locale, t, date, money]
  )

  const kpis = React.useMemo(() => {
    const total = data.invoices.reduce((sum, i) => sum + i.amount, 0)
    const collected = data.invoices.reduce((sum, i) => sum + i.paid, 0)
    const overdue = data.invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + (i.amount - i.paid), 0)
    return [
      {
        id: "total",
        label: t("common.total"),
        value: total,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[0],
      },
      {
        id: "collected",
        label: t("finance.collected"),
        value: collected,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[5],
      },
      {
        id: "outstanding",
        label: t("finance.outstanding"),
        value: total - collected,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[3],
      },
      {
        id: "overdue",
        label: t("finance.overdue"),
        value: overdue,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[4],
      },
    ]
  }, [data.invoices, t, money.symbol])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("finance.invoices")}
        subtitle={t("nav.groups.resources")}
      >
        <Button variant="outline" size="sm">
          <Send />
          {t("common.share")}
        </Button>
        <Button variant="outline" size="sm">
          <Download />
          {t("common.export")}
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
          emptyIcon={<Receipt />}
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
                      : t(`finance.${value}` as never),
                }))}
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
