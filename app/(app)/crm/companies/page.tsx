"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Building2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { CompoundFilter, UnderlineTabs } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { Sparkline } from "@/components/motion/comb-chart"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { Company } from "@/lib/types"

export default function CompaniesPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, relative } = useLocale()
  const [query, setQuery] = React.useState("")
  const [tab, setTab] = React.useState<"companies" | "deals" | "forecast">(
    "companies"
  )

  const columns = React.useMemo<ColumnDef<Company, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("crm.companies"),
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <Building2 className="size-3 text-muted-foreground" />
            <span className="font-medium">{row.original.name}</span>
          </span>
        ),
      },
      {
        accessorKey: "segment",
        header: t("crm.segmentAndStage"),
        cell: ({ row }) => (
          <span className="flex items-center gap-1">
            <StatusTag hue={row.original.hue}>
              {t(`crm.segments.${row.original.segment}` as never)}
            </StatusTag>
            <StatusTag hue="slate">{row.original.industry[locale]}</StatusTag>
          </span>
        ),
      },
      {
        id: "owner",
        accessorFn: (row) => lookups.staff.get(row.ownerId)?.name[locale] ?? "",
        header: t("crm.owner"),
        cell: ({ row }) => {
          const owner = lookups.staff.get(row.original.ownerId)
          return owner ? (
            <span className="flex items-center gap-1.5">
              <Avatar
                name={owner.name[locale]}
                seed={owner.avatarSeed}
                size={20}
              />
              <span className="truncate">{owner.name[locale]}</span>
            </span>
          ) : null
        },
      },
      {
        accessorKey: "roomNights",
        header: t("crm.roomNights"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.roomNights),
      },
      {
        accessorKey: "accountValue",
        header: t("crm.accountValue"),
        meta: { align: "right" },
        cell: ({ row }) => money.compact(row.original.accountValue),
      },
      {
        id: "trend",
        header: t("common.thisMonth"),
        enableSorting: false,
        cell: ({ row }) => (
          <Sparkline
            values={Array.from({ length: 16 }, (_, i) =>
              Math.abs(Math.sin(i + row.original.roomNights))
            )}
            color={CHART_COLORS[row.original.roomNights % CHART_COLORS.length]}
          />
        ),
      },
      {
        accessorKey: "lastActivity",
        header: t("crm.lastActivity"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {relative(row.original.lastActivity)}
          </span>
        ),
      },
    ],
    [lookups, locale, t, num, money, relative]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("crm.companies")} subtitle={t("nav.groups.crm")}>
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>

      <div className="border-b border-[var(--hairline)] px-5">
        <UnderlineTabs
          value={tab}
          onChange={setTab}
          options={[
            {
              value: "companies",
              label: t("crm.companies"),
              count: num(data.companies.length),
            },
            {
              value: "deals",
              label: t("crm.deals"),
              count: num(data.deals.length),
            },
            { value: "forecast", label: t("ai.forecast") },
          ]}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-3">
        <DataTable
          data={data.companies}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Building2 />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <CompoundFilter label={t("common.sortBy")}>
                {t("crm.pipelineValue")}
              </CompoundFilter>
              <CompoundFilter label={t("common.filter")}>
                {t("crm.allOwners")}
              </CompoundFilter>
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
