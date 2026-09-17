"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Bilingual, StaffMember, TagHue } from "@/lib/types"

const ROLES: { name: Bilingual; hue: TagHue }[] = [
  { name: { en: "Owner", bn: "স্বত্বাধিকারী" }, hue: "purple" },
  { name: { en: "General Manager", bn: "মহাব্যবস্থাপক" }, hue: "blue" },
  { name: { en: "Front Office", bn: "ফ্রন্ট অফিস" }, hue: "teal" },
  { name: { en: "Housekeeping", bn: "হাউসকিপিং" }, hue: "amber" },
  { name: { en: "Finance", bn: "অর্থ" }, hue: "green" },
  { name: { en: "Read-only", bn: "শুধু পাঠ" }, hue: "slate" },
]

export default function UsersPage() {
  const data = useDataset()
  const { t, locale, num, relative } = useLocale()
  const [query, setQuery] = React.useState("")

  const users = React.useMemo(() => data.staff.slice(0, 22), [data.staff])

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
                {row.original.email}
              </span>
            </span>
          </span>
        ),
      },
      {
        id: "role",
        accessorFn: (_row, index) => ROLES[index % ROLES.length].name[locale],
        header: t("staff.role"),
        cell: ({ row }) => {
          const role = ROLES[users.indexOf(row.original) % ROLES.length]
          return <StatusTag hue={role.hue}>{role.name[locale]}</StatusTag>
        },
      },
      {
        accessorKey: "department",
        header: t("staff.department"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {t(`staff.departments.${row.original.department}` as never)}
          </span>
        ),
      },
      {
        id: "lastSeen",
        accessorFn: (row) => row.joinedAt,
        header: t("admin.lastSeen"),
        meta: { align: "right" },
        cell: ({ row }) => {
          const index = users.indexOf(row.original)
          return (
            <span className="text-muted-foreground">
              {relative(
                new Date(Date.now() - index * 3_600_000 * 7).toISOString()
              )}
            </span>
          )
        },
      },
      {
        id: "status",
        header: t("common.status"),
        meta: { align: "right" },
        enableSorting: false,
        cell: ({ row }) => {
          const index = users.indexOf(row.original)
          return (
            <StatusTag hue={index % 9 === 4 ? "slate" : "green"} dot>
              {t(index % 9 === 4 ? "common.disabled" : "common.enabled")}
            </StatusTag>
          )
        },
      },
    ],
    [locale, t, relative, users]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("admin.users")}
        subtitle={`${num(users.length)} ${t("admin.users").toLowerCase()}`}
      >
        <Button size="sm">
          <Plus />
          {t("admin.invite")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={users}
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
