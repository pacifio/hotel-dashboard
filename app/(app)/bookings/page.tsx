"use client"

import * as React from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarDays, CalendarPlus, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { SOURCE_HUE, SOURCE_LABEL } from "@/lib/labels"
import type { Reservation, ReservationStatus, TagHue } from "@/lib/types"

const STATUS_HUE: Record<ReservationStatus, TagHue> = {
  confirmed: "blue",
  pending: "amber",
  checkedIn: "green",
  checkedOut: "slate",
  cancelled: "rose",
  noShow: "magenta",
}

const FILTERS = [
  "all",
  "confirmed",
  "pending",
  "checkedIn",
  "cancelled",
] as const

export default function BookingsPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, date } = useLocale()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.reservations
        : data.reservations.filter((r) => r.status === filter),
    [data.reservations, filter]
  )

  const columns = React.useMemo<ColumnDef<Reservation, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("bookings.bookingId"),
        cell: ({ row }) => (
          <span className="nums font-medium">{row.original.code}</span>
        ),
      },
      {
        id: "guest",
        accessorFn: (row) => lookups.guest.get(row.guestId)?.name[locale] ?? "",
        header: t("common.guest"),
        cell: ({ row }) => {
          const guest = lookups.guest.get(row.original.guestId)
          return (
            <span className="flex items-center gap-2">
              <Avatar
                name={guest?.name[locale] ?? "—"}
                seed={guest?.avatarSeed}
                size={22}
              />
              <span className="truncate">{guest?.name[locale]}</span>
            </span>
          )
        },
      },
      {
        accessorKey: "checkIn",
        header: t("bookings.checkInDate"),
        cell: ({ row }) => date(row.original.checkIn),
      },
      {
        accessorKey: "checkOut",
        header: t("bookings.checkOutDate"),
        cell: ({ row }) => date(row.original.checkOut),
      },
      {
        accessorKey: "nights",
        header: t("common.nights"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.nights),
      },
      {
        accessorKey: "roomTypeId",
        header: t("bookings.roomType"),
        cell: ({ row }) => (
          <StatusTag hue="slate">
            {t(`rooms.types.${row.original.roomTypeId}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "source",
        header: t("bookings.source"),
        cell: ({ row }) => (
          <StatusTag hue={SOURCE_HUE[row.original.source]}>
            {SOURCE_LABEL[row.original.source][locale]}
          </StatusTag>
        ),
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={STATUS_HUE[row.original.status]} dot>
            {t(`bookings.${row.original.status}` as never)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "total",
        header: t("common.total"),
        meta: { align: "right" },
        cell: ({ row }) => money.format(row.original.total),
      },
    ],
    [lookups, locale, t, num, date, money]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("bookings.title")}
        subtitle={`${num(data.reservations.length)} ${t("bookings.title").toLowerCase()}`}
      >
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/bookings/calendar" />}
        >
          <CalendarDays />
          {t("nav.bookingCalendar")}
        </Button>
        <Button variant="outline" size="sm">
          <Download />
          {t("common.export")}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/bookings/new" />}
        >
          <CalendarPlus />
          {t("bookings.newBooking")}
        </Button>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
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
                      : t(`bookings.${value}` as never),
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
