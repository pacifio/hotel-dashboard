"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Boxes, Plus, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { InventoryItem } from "@/lib/types"

export default function StockPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num } = useLocale()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "low" | "out">("all")

  const level = (item: InventoryItem) =>
    item.onHand === 0 ? "out" : item.onHand < item.reorderPoint ? "low" : "in"

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.inventory
        : data.inventory.filter((item) => level(item) === filter),
    [data.inventory, filter]
  )

  const columns = React.useMemo<ColumnDef<InventoryItem, unknown>[]>(
    () => [
      {
        accessorKey: "sku",
        header: t("inventory.sku"),
        cell: ({ row }) => (
          <span className="nums text-muted-foreground">{row.original.sku}</span>
        ),
      },
      {
        id: "name",
        accessorFn: (row) => row.name[locale],
        header: t("common.name"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name[locale]}</span>
        ),
      },
      {
        id: "category",
        accessorFn: (row) => row.category[locale],
        header: t("inventory.category"),
        cell: ({ row }) => (
          <StatusTag hue="slate">{row.original.category[locale]}</StatusTag>
        ),
      },
      {
        accessorKey: "onHand",
        header: t("inventory.onHand"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="flex items-center justify-end gap-1.5">
            {num(row.original.onHand)}
            <span className="text-[0.625rem] text-muted-foreground">
              {row.original.unit[locale]}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "reorderPoint",
        header: t("inventory.reorderPoint"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.reorderPoint),
      },
      {
        id: "level",
        accessorFn: (row) => level(row),
        header: t("common.status"),
        cell: ({ row }) => {
          const state = level(row.original)
          return (
            <StatusTag
              hue={
                state === "out" ? "rose" : state === "low" ? "amber" : "green"
              }
              dot
            >
              {t(
                state === "out"
                  ? "inventory.outOfStock"
                  : state === "low"
                    ? "inventory.lowStock"
                    : "inventory.inStock"
              )}
            </StatusTag>
          )
        },
      },
      {
        id: "supplier",
        accessorFn: (row) =>
          lookups.supplier.get(row.supplierId)?.name[locale] ?? "",
        header: t("inventory.supplier"),
        cell: ({ row }) => (
          <span className="truncate text-muted-foreground">
            {lookups.supplier.get(row.original.supplierId)?.name[locale]}
          </span>
        ),
      },
      {
        accessorKey: "unitCost",
        header: t("inventory.unitCost"),
        meta: { align: "right" },
        cell: ({ row }) => money.format(row.original.unitCost),
      },
      {
        id: "value",
        accessorFn: (row) => row.onHand * row.unitCost,
        header: t("common.total"),
        meta: { align: "right" },
        cell: ({ row }) =>
          money.compact(row.original.onHand * row.original.unitCost),
      },
    ],
    [lookups, locale, t, num, money]
  )

  const kpis = React.useMemo(() => {
    const value = data.inventory.reduce(
      (sum, item) => sum + item.onHand * item.unitCost,
      0
    )
    return [
      {
        id: "skus",
        label: t("inventory.sku"),
        value: data.inventory.length,
        color: CHART_COLORS[0],
      },
      {
        id: "low",
        label: t("inventory.lowStock"),
        value: data.inventory.filter((i) => level(i) === "low").length,
        color: CHART_COLORS[3],
      },
      {
        id: "out",
        label: t("inventory.outOfStock"),
        value: data.inventory.filter((i) => level(i) === "out").length,
        color: CHART_COLORS[4],
      },
      {
        id: "value",
        label: t("common.total"),
        value,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[1],
      },
    ]
  }, [data.inventory, t, money.symbol])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.stock")}
        subtitle={t("nav.groups.resources")}
      >
        <Button variant="outline" size="sm">
          <TriangleAlert />
          {t("inventory.reorderPoint")}
        </Button>
        <Button size="sm">
          <Plus />
          {t("common.new")}
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
          emptyIcon={<Boxes />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "low", label: t("inventory.lowStock") },
                  { value: "out", label: t("inventory.outOfStock") },
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
