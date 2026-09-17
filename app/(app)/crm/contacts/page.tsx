"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Mail, Phone, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Contact } from "@/lib/types"

export default function ContactsPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, relative } = useLocale()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<Contact, unknown>[]>(
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
                {row.original.title[locale]}
              </span>
            </span>
          </span>
        ),
      },
      {
        id: "company",
        accessorFn: (row) => lookups.company.get(row.companyId)?.name ?? "",
        header: t("crm.companies"),
        cell: ({ row }) => {
          const company = lookups.company.get(row.original.companyId)
          return company ? (
            <StatusTag hue={company.hue}>{company.name}</StatusTag>
          ) : null
        },
      },
      {
        accessorKey: "email",
        header: t("common.email"),
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="size-3" />
            <span className="truncate">{row.original.email}</span>
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: t("common.phone"),
        cell: ({ row }) => (
          <span className="nums flex items-center gap-1.5 text-muted-foreground">
            <Phone className="size-3" />
            {row.original.phone}
          </span>
        ),
      },
      {
        accessorKey: "lastTouch",
        header: t("crm.lastActivity"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {relative(row.original.lastTouch)}
          </span>
        ),
      },
    ],
    [lookups, locale, t, relative]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("crm.contacts")}
        subtitle={`${num(data.contacts.length)} ${t("crm.contacts").toLowerCase()}`}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={data.contacts}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Users />}
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
