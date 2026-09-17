"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Star, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Supplier } from "@/lib/types"

export default function SuppliersPage() {
  const data = useDataset()
  const { t, locale, num, dec } = useLocale()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<Supplier, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name[locale],
        header: t("inventory.supplier"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name[locale]}</span>
        ),
      },
      {
        id: "category",
        accessorFn: (row) => row.category[locale],
        header: t("inventory.category"),
        cell: ({ row }) => (
          <StatusTag hue="teal">{row.original.category[locale]}</StatusTag>
        ),
      },
      {
        id: "contact",
        accessorFn: (row) => row.contact[locale],
        header: t("crm.contacts"),
        cell: ({ row }) => row.original.contact[locale],
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
        accessorKey: "leadTimeDays",
        header: t("inventory.leadTime"),
        meta: { align: "right" },
        cell: ({ row }) => `${num(row.original.leadTimeDays)}d`,
      },
      {
        accessorKey: "openOrders",
        header: t("inventory.ordered"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.openOrders),
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
    ],
    [locale, t, num, dec]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.suppliers")}
        subtitle={t("nav.groups.resources")}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={data.suppliers}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Truck />}
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
