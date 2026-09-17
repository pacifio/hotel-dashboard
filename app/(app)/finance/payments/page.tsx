"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CreditCard } from "lucide-react"

import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Payment, PaymentMethod, TagHue } from "@/lib/types"

const HUE: Record<PaymentMethod, TagHue> = {
  card: "blue",
  cash: "green",
  bankTransfer: "purple",
  mobileWallet: "magenta",
  corporate: "teal",
  ota: "amber",
}

export default function PaymentsPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, date } = useLocale()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<Payment, unknown>[]>(
    () => [
      {
        accessorKey: "reference",
        header: t("finance.payments"),
        cell: ({ row }) => (
          <span className="nums font-medium">{row.original.reference}</span>
        ),
      },
      {
        id: "invoice",
        accessorFn: (row) => lookups.invoice.get(row.invoiceId)?.number ?? "",
        header: t("finance.invoiceNumber"),
        cell: ({ row }) => (
          <span className="nums text-muted-foreground">
            {lookups.invoice.get(row.original.invoiceId)?.number}
          </span>
        ),
      },
      {
        accessorKey: "method",
        header: t("finance.method"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.method]}>
            {t(`finance.methods.${row.original.method}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "at",
        header: t("common.date"),
        meta: { align: "right" },
        cell: ({ row }) => date(row.original.at),
      },
      {
        accessorKey: "amount",
        header: t("common.amount"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="font-medium">
            {money.format(row.original.amount)}
          </span>
        ),
      },
    ],
    [lookups, t, date, money]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("finance.payments")}
        subtitle={t("finance.collected")}
      />
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={data.payments}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<CreditCard />}
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
