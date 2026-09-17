"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { GanttRack, type RackBooking } from "@/components/motion/gantt-rack"
import { PageHeader } from "@/components/motion/card-shell"
import { CompoundFilter, UnderlineTabs } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { addDays, demoToday, isoDay, startOfMonth } from "@/lib/demo-time"

type Tab = "all" | "arrivals" | "departures"

export default function RoomRackPage() {
  const data = useDataset()
  const tenant = useTenant()
  const lookups = useLookups()
  const { t, locale, num, date } = useLocale()

  const [month, setMonth] = React.useState(() => startOfMonth(demoToday()))
  const [tab, setTab] = React.useState<Tab>("all")
  const [query, setQuery] = React.useState("")
  /** Drag edits live only in the session — the generated dataset stays pristine. */
  const [edits, setEdits] = React.useState<
    Record<string, { roomId: string; checkIn: string; checkOut: string }>
  >({})

  const today = React.useMemo(() => isoDay(demoToday()), [])

  const reservations = React.useMemo(
    () =>
      data.reservations.map((reservation) => {
        const edit = edits[reservation.id]
        return edit ? { ...reservation, ...edit } : reservation
      }),
    [data.reservations, edits]
  )

  const typeHue = React.useMemo(
    () => new Map(data.roomTypes.map((type) => [type.id, type.hue])),
    [data.roomTypes]
  )

  const bookings: RackBooking[] = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return reservations
      .filter((reservation) => {
        if (tab === "arrivals" && reservation.checkIn !== today) return false
        if (tab === "departures" && reservation.checkOut !== today) return false
        if (!normalizedQuery) return true
        const guest = lookups.guest.get(reservation.guestId)
        return (
          guest?.name.en.toLowerCase().includes(normalizedQuery) ||
          guest?.name.bn.includes(normalizedQuery) ||
          reservation.code.toLowerCase().includes(normalizedQuery)
        )
      })
      .map((reservation) => ({
        reservation,
        guestName: lookups.guest.get(reservation.guestId)?.name[locale] ?? "—",
        hue: typeHue.get(reservation.roomTypeId) ?? "slate",
      }))
  }, [reservations, tab, today, query, lookups, locale, typeHue])

  const counts = React.useMemo(
    () => ({
      all: data.rooms.length,
      arrivals: reservations.filter((r) => r.checkIn === today).length,
      departures: reservations.filter((r) => r.checkOut === today).length,
    }),
    [data.rooms.length, reservations, today]
  )

  const move = React.useCallback(
    (reservationId: string, roomId: string, dayDelta: number) => {
      const source = reservations.find((r) => r.id === reservationId)
      if (!source) return

      const checkIn = isoDay(addDays(new Date(source.checkIn), dayDelta))
      const checkOut = isoDay(addDays(new Date(source.checkOut), dayDelta))

      // Refuse a move that would overlap an existing stay in the target room.
      const clash = reservations.find(
        (other) =>
          other.id !== reservationId &&
          other.roomId === roomId &&
          other.status !== "cancelled" &&
          other.checkIn < checkOut &&
          other.checkOut > checkIn
      )

      const guestName =
        lookups.guest.get(source.guestId)?.name[locale] ?? source.code
      const room = data.rooms.find((r) => r.id === roomId)

      if (clash) {
        toast.error(t("rooms.conflict"), {
          description: `${guestName} · ${room?.number ?? ""}`,
        })
        return
      }

      setEdits((prev) => ({
        ...prev,
        [reservationId]: { roomId, checkIn, checkOut },
      }))
      toast.success(
        t("rooms.movedBooking", {
          guest: guestName,
          room: num(Number(room?.number ?? 0), { useGrouping: false }),
        }),
        { description: `${date(checkIn)} → ${date(checkOut)}` }
      )
    },
    [reservations, lookups, locale, data.rooms, t, num, date]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("rooms.roomRack")}
        subtitle={`${tenant.name[locale]} · ${num(tenant.roomCount)} ${t("common.rooms").toLowerCase()}`}
      >
        <div className="relative">
          <Search className="absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("common.search")}
            className="h-7 w-[168px] rounded-full border border-border bg-card pr-2.5 pl-7 text-[0.6875rem] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
        <Button variant="outline" size="sm">
          <ListFilter />
          {t("common.filter")}
        </Button>
        <Button variant="outline" size="sm">
          <SlidersHorizontal />
          {t("common.sort")}
        </Button>
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] px-5">
        <UnderlineTabs
          value={tab}
          onChange={setTab}
          options={[
            {
              value: "all",
              label: t("rooms.allRooms"),
              count: num(counts.all),
            },
            {
              value: "arrivals",
              label: t("frontDesk.arrivals"),
              count: num(counts.arrivals),
            },
            {
              value: "departures",
              label: t("frontDesk.departures"),
              count: num(counts.departures),
            },
          ]}
        />
        <div className="flex items-center gap-1.5 pb-2">
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5">
            <button
              onClick={() => setMonth(shiftMonth(month, -1))}
              className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-3" />
            </button>
            <span className="nums px-1.5 text-[0.6875rem] font-medium">
              {date(month, { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={() => setMonth(shiftMonth(month, 1))}
              className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-3" />
            </button>
          </div>
          <CompoundFilter
            label={t("rooms.title")}
            onClick={() => setMonth(startOfMonth(demoToday()))}
          >
            {t("common.today")}
          </CompoundFilter>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-2">
        {data.roomTypes.map((type) => (
          <StatusTag key={type.id} hue={type.hue} dot>
            {t(`rooms.types.${type.id}` as never)}
            <span className="nums ml-0.5 opacity-70">{num(type.count)}</span>
          </StatusTag>
        ))}
        <span className="ml-auto text-[0.625rem] text-muted-foreground">
          {locale === "bn"
            ? "বুকিং টেনে অন্য কক্ষ বা তারিখে সরান"
            : "Drag a booking to another room or date"}
        </span>
      </div>

      <div className="min-h-0 flex-1 px-5 pb-5">
        <GanttRack
          month={month}
          rooms={data.rooms}
          roomTypes={data.roomTypes}
          bookings={bookings}
          onMove={move}
          className="h-full"
        />
      </div>
    </div>
  )
}

function shiftMonth(date: Date, delta: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1)
  )
}
