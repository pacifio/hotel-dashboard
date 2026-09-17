"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { PurchaseOrder, PurchaseOrderStatus, TagHue } from "@/lib/types"

const HUE: Record<PurchaseOrderStatus, TagHue> = {
  draft: "slate",
  approved: "blue",
  ordered: "amber",
  received: "green",
  cancelled: "rose",
}

export default function PurchaseOrdersPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, date } = useLocale()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<PurchaseOrder, unknown>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("inventory.poNumber"),
        cell: ({ row }) => (
          <span className="nums font-medium">{row.original.number}</span>
        ),
      },
      {
        id: "supplier",
        accessorFn: (row) =>
          lookups.supplier.get(row.supplierId)?.name[locale] ?? "",
        header: t("inventory.supplier"),
        cell: ({ row }) =>
          lookups.supplier.get(row.original.supplierId)?.name[locale],
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.status]} dot>
            {t(`inventory.${row.original.status}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "lines",
        header: t("common.total"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.lines),
      },
      {
        accessorKey: "createdAt",
        header: t("common.date"),
        meta: { align: "right" },
        cell: ({ row }) => date(row.original.createdAt),
      },
      {
        accessorKey: "expectedAt",
        header: t("inventory.leadTime"),
        meta: { align: "right" },
        cell: ({ row }) => date(row.original.expectedAt),
      },
      {
        accessorKey: "total",
        header: t("common.amount"),
        meta: { align: "right" },
        cell: ({ row }) => money.format(row.original.total),
      },
    ],
    [lookups, locale, t, num, date, money]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.purchaseOrders")}
        subtitle={t("nav.groups.resources")}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={data.purchaseOrders}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<ShoppingCart />}
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
