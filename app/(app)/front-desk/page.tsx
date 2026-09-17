"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { motion } from "motion/react"
import {
  BedDouble,
  Check,
  DoorOpen,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { UnderlineTabs } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useMoney, useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { demoToday, isoDay } from "@/lib/demo-time"
import { CHART_COLORS } from "@/lib/hue"
import { SOURCE_HUE, SOURCE_LABEL } from "@/lib/labels"
import type { Reservation } from "@/lib/types"

type Tab = "arrivals" | "departures" | "inHouse" | "walkIn"

export default function FrontDeskPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const tenant = useTenant()
  const { t, locale, num, date } = useLocale()

  const [tab, setTab] = React.useState<Tab>("arrivals")
  const [query, setQuery] = React.useState("")
  const [actioned, setActioned] = React.useState<Record<string, boolean>>({})

  const today = React.useMemo(() => isoDay(demoToday()), [])

  const buckets = React.useMemo(() => {
    const arrivals = data.reservations.filter(
      (r) => r.checkIn === today && r.status !== "cancelled"
    )
    const departures = data.reservations.filter((r) => r.checkOut === today)
    const inHouse = data.reservations.filter((r) => r.status === "checkedIn")
    const walkIn = data.reservations
      .filter((r) => r.source === "walkIn")
      .slice(0, 24)
    return { arrivals, departures, inHouse, walkIn }
  }, [data.reservations, today])

  const rows = buckets[tab]

  const columns = React.useMemo<ColumnDef<Reservation, unknown>[]>(
    () => [
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
                size={24}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {guest?.name[locale]}
                </span>
                <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                  {row.original.code}
                </span>
              </span>
            </span>
          )
        },
      },
      {
        id: "room",
        accessorFn: (row) => lookups.room.get(row.roomId)?.number ?? "",
        header: t("common.room"),
        cell: ({ row }) => {
          const room = lookups.room.get(row.original.roomId)
          return (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3 text-muted-foreground" />
              <span className="nums">
                {room ? num(Number(room.number), { useGrouping: false }) : "—"}
              </span>
              <StatusTag hue="slate">
                {t(`rooms.types.${row.original.roomTypeId}` as never)}
              </StatusTag>
            </span>
          )
        },
      },
      {
        accessorKey: "nights",
        header: t("common.nights"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.nights),
      },
      {
        id: "pax",
        accessorFn: (row) => row.adults + row.children,
        header: t("common.guests"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.adults + row.original.children),
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
        id: "balance",
        accessorFn: (row) => row.total - row.paid,
        header: t("frontDesk.balance"),
        meta: { align: "right" },
        cell: ({ row }) => {
          const balance = row.original.total - row.original.paid
          return (
            <span className={balance > 0 ? "text-[var(--warning)]" : undefined}>
              {money.format(balance)}
            </span>
          )
        },
      },
      {
        id: "action",
        header: t("common.actions"),
        meta: { align: "right" },
        enableSorting: false,
        cell: ({ row }) => {
          const done = actioned[row.original.id]
          const isDeparture = tab === "departures"
          return (
            <Button
              size="xs"
              variant={done ? "secondary" : isDeparture ? "outline" : "default"}
              disabled={done}
              onClick={(event) => {
                event.stopPropagation()
                setActioned((prev) => ({ ...prev, [row.original.id]: true }))
                const guest = lookups.guest.get(row.original.guestId)
                toast.success(
                  isDeparture
                    ? t("frontDesk.checkOut")
                    : t("frontDesk.checkIn"),
                  { description: guest?.name[locale] }
                )
              }}
            >
              {done ? <Check /> : isDeparture ? <LogOut /> : <KeyRound />}
              {done
                ? t("common.done")
                : isDeparture
                  ? t("frontDesk.checkOut")
                  : t("frontDesk.checkIn")}
            </Button>
          )
        },
      },
    ],
    [lookups, locale, t, num, money, actioned, tab]
  )

  const kpis = React.useMemo(
    () => [
      {
        id: "arrivals",
        label: t("frontDesk.arrivals"),
        value: buckets.arrivals.length,
        color: CHART_COLORS[0],
      },
      {
        id: "departures",
        label: t("frontDesk.departures"),
        value: buckets.departures.length,
        color: CHART_COLORS[3],
      },
      {
        id: "inHouse",
        label: t("frontDesk.inHouse"),
        value: buckets.inHouse.length,
        color: CHART_COLORS[1],
      },
      {
        id: "available",
        label: t("dashboard.available"),
        value: Math.max(0, tenant.roomCount - buckets.inHouse.length),
        color: CHART_COLORS[5],
      },
    ],
    [buckets, tenant.roomCount, t]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("frontDesk.title")}
        subtitle={date(demoToday(), {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      >
        <Button variant="outline" size="sm">
          <ShieldCheck />
          {t("frontDesk.idVerified")}
        </Button>
        <Button size="sm">
          <UserPlus />
          {t("frontDesk.walkIn")}
        </Button>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />

        <div className="border-b border-[var(--hairline)]">
          <UnderlineTabs
            value={tab}
            onChange={setTab}
            options={[
              {
                value: "arrivals",
                label: t("frontDesk.arrivals"),
                count: num(buckets.arrivals.length),
                icon: <DoorOpen className="size-3" />,
              },
              {
                value: "departures",
                label: t("frontDesk.departures"),
                count: num(buckets.departures.length),
                icon: <LogOut className="size-3" />,
              },
              {
                value: "inHouse",
                label: t("frontDesk.inHouse"),
                count: num(buckets.inHouse.length),
                icon: <Users className="size-3" />,
              },
              {
                value: "walkIn",
                label: t("frontDesk.walkIn"),
                count: num(buckets.walkIn.length),
                icon: <UserPlus className="size-3" />,
              },
            ]}
          />
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="flex min-h-0 flex-1"
        >
          <DataTable
            data={rows}
            columns={columns}
            globalFilter={query}
            onGlobalFilterChange={setQuery}
            rowId={(row) => row.id}
            selectable
            className="min-h-0 flex-1"
            toolbar={
              <TableSearch
                value={query}
                onChange={setQuery}
                className="ml-auto"
              />
            }
          />
        </motion.div>
      </div>
    </div>
  )
}
