"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Database } from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { AuditEntry } from "@/lib/types"

export default function AuditLogPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, dateTime, relative } = useLocale()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<AuditEntry, unknown>[]>(
    () => [
      {
        id: "actor",
        accessorFn: (row) => lookups.staff.get(row.actorId)?.name[locale] ?? "",
        header: t("admin.actor"),
        cell: ({ row }) => {
          const actor = lookups.staff.get(row.original.actorId)
          return (
            <span className="flex items-center gap-2">
              <Avatar
                name={actor?.name[locale] ?? "—"}
                seed={actor?.avatarSeed}
                size={22}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {actor?.name[locale]}
                </span>
                <span className="block truncate text-[0.625rem] text-muted-foreground">
                  {actor?.role[locale]}
                </span>
              </span>
            </span>
          )
        },
      },
      {
        id: "action",
        accessorFn: (row) => row.action[locale],
        header: t("admin.action"),
        cell: ({ row }) => row.original.action[locale],
      },
      {
        accessorKey: "target",
        header: t("admin.target"),
        cell: ({ row }) => (
          <StatusTag hue="slate">{row.original.target}</StatusTag>
        ),
      },
      {
        accessorKey: "ip",
        header: t("admin.ipAddress"),
        cell: ({ row }) => (
          <span className="nums text-muted-foreground">{row.original.ip}</span>
        ),
      },
      {
        accessorKey: "at",
        header: t("common.date"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span
            title={dateTime(row.original.at)}
            className="text-muted-foreground"
          >
            {relative(row.original.at)}
          </span>
        ),
      },
    ],
    [lookups, locale, t, dateTime, relative]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("admin.auditLog")}
        subtitle={t("nav.groups.administration")}
      />
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={data.audit}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Database />}
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
