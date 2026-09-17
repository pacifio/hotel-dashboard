"use client"

import * as React from "react"
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
} from "@dnd-kit/core"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { HUE_VAR } from "@/lib/hue"
import { addDays, daysInMonth, demoToday, isoDay } from "@/lib/demo-time"
import type { Reservation, Room, RoomType, TagHue } from "@/lib/types"

export const DAY_W = 34
export const ROW_H = 30
export const LABEL_W = 186

export type RackBooking = {
  reservation: Reservation
  guestName: string
  hue: TagHue
}

/**
 * room-overview.jpg — the room-occupancy rack. Rooms grouped by type in
 * collapsible blocks, stays as pastel bars across a month grid, and a draggable
 * scrubber with a black "N booked" chip. Bars can be dragged to another room or
 * another date; the drop is resolved from pixel delta rather than a droppable
 * per cell, so a 380-room property stays responsive.
 */
export function GanttRack({
  month,
  rooms,
  roomTypes,
  bookings,
  onMove,
  className,
}: {
  month: Date
  rooms: Room[]
  roomTypes: RoomType[]
  bookings: RackBooking[]
  onMove?: (reservationId: string, roomId: string, dayDelta: number) => void
  className?: string
}) {
  const { t, num, tk } = useLocale()
  const days = daysInMonth(month)
  const monthStart = isoDay(month)
  const monthEnd = isoDay(addDays(month, days))
  const today = React.useMemo(() => demoToday(), [])

  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  const [scrubDay, setScrubDay] = React.useState(() => {
    const offset = Math.round((today.getTime() - month.getTime()) / 86_400_000)
    return Math.min(days - 1, Math.max(0, offset))
  })
  const [drag, setDrag] = React.useState<{
    id: string
    dx: number
    dy: number
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const roomOrder = React.useMemo(() => {
    const order: { room: Room; index: number }[] = []
    let index = 0
    for (const type of roomTypes) {
      for (const room of rooms.filter((r) => r.typeId === type.id)) {
        order.push({ room, index: index++ })
      }
    }
    return order
  }, [rooms, roomTypes])

  const roomIndex = React.useMemo(
    () => new Map(roomOrder.map(({ room }, i) => [room.id, i])),
    [roomOrder]
  )

  const byRoom = React.useMemo(() => {
    const map = new Map<string, RackBooking[]>()
    for (const booking of bookings) {
      if (
        booking.reservation.checkOut <= monthStart ||
        booking.reservation.checkIn >= monthEnd ||
        booking.reservation.status === "cancelled"
      ) {
        continue
      }
      const list = map.get(booking.reservation.roomId) ?? []
      list.push(booking)
      map.set(booking.reservation.roomId, list)
    }
    for (const [roomId, list] of map) {
      list.sort((a, b) =>
        a.reservation.checkIn.localeCompare(b.reservation.checkIn)
      )
      map.set(roomId, list)
    }
    return map
  }, [bookings, monthStart, monthEnd])

  const scrubIso = isoDay(addDays(month, scrubDay))
  const bookedOnScrubDay = React.useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.reservation.checkIn <= scrubIso &&
          b.reservation.checkOut > scrubIso &&
          b.reservation.status !== "cancelled"
      ).length,
    [bookings, scrubIso]
  )

  const handleDragMove = (event: DragMoveEvent) => {
    setDrag({
      id: String(event.active.id),
      dx: event.delta.x,
      dy: event.delta.y,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDrag(null)
    const id = String(event.active.id)
    const booking = bookings.find((b) => b.reservation.id === id)
    if (!booking || !onMove) return

    const dayDelta = Math.round(event.delta.x / DAY_W)
    const rowDelta = Math.round(event.delta.y / ROW_H)
    const from = roomIndex.get(booking.reservation.roomId) ?? 0
    const target =
      roomOrder[Math.min(roomOrder.length - 1, Math.max(0, from + rowDelta))]
    if (!target) return
    if (dayDelta === 0 && target.room.id === booking.reservation.roomId) return
    onMove(id, target.room.id, dayDelta)
  }

  return (
    <div
      data-slot="gantt-rack"
      className={cn(
        "relative overflow-auto rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      <DndContext
        id="room-rack"
        sensors={sensors}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDrag(null)}
      >
        <div
          className="relative"
          style={{ width: LABEL_W + days * DAY_W, minWidth: "100%" }}
        >
          {/* Day header */}
          <div className="sticky top-0 z-30 flex bg-card/95 backdrop-blur-xl">
            <div
              className="sticky left-0 z-10 flex shrink-0 items-center border-r border-b border-[var(--hairline)] bg-card/95 px-3 backdrop-blur-xl"
              style={{ width: LABEL_W, height: ROW_H + 8 }}
            >
              <span className="micro">{t("rooms.allRooms")}</span>
            </div>
            <div
              className="relative flex border-b border-[var(--hairline)]"
              style={{ height: ROW_H + 8 }}
            >
              {Array.from({ length: days }, (_, i) => {
                const day = addDays(month, i)
                const weekend = [5, 6].includes(day.getUTCDay())
                const isToday = isoDay(day) === isoDay(today)
                return (
                  <button
                    key={i}
                    onClick={() => setScrubDay(i)}
                    className={cn(
                      "nums flex shrink-0 items-center justify-center text-[0.625rem] transition-colors",
                      weekend
                        ? "bg-muted/45 text-muted-foreground"
                        : "text-muted-foreground",
                      isToday && "font-medium text-primary",
                      i === scrubDay && "text-foreground"
                    )}
                    style={{ width: DAY_W }}
                  >
                    {num(day.getUTCDate(), { minimumIntegerDigits: 2 })}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Groups */}
          {roomTypes.map((type) => {
            const typeRooms = rooms.filter((room) => room.typeId === type.id)
            if (!typeRooms.length) return null
            const isCollapsed = collapsed[type.id]
            const groupBookings = typeRooms.reduce(
              (sum, room) => sum + (byRoom.get(room.id)?.length ?? 0),
              0
            )

            return (
              <div key={type.id}>
                <div className="sticky left-0 z-20 flex h-8 items-center gap-2 border-b border-[var(--hairline)] bg-surface px-3">
                  <button
                    onClick={() =>
                      setCollapsed((state) => ({
                        ...state,
                        [type.id]: !state[type.id],
                      }))
                    }
                    className="flex items-center gap-2 text-[0.6875rem] font-medium tracking-wide uppercase outline-none"
                  >
                    <span
                      className="size-2 rounded-[3px]"
                      style={{ background: HUE_VAR[type.hue] }}
                    />
                    {tk(`rooms.types.${type.id}`)}
                    <motion.span
                      animate={{ rotate: isCollapsed ? -90 : 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </motion.span>
                  </button>
                  <span className="nums rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
                    {num(typeRooms.length)}
                  </span>
                  <span className="text-[0.625rem] text-muted-foreground">
                    {t("rooms.booked", { count: num(groupBookings) })}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {!isCollapsed ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {typeRooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex"
                          style={{ height: ROW_H }}
                        >
                          <div
                            className="sticky left-0 z-10 flex shrink-0 items-center justify-between gap-2 border-r border-b border-[var(--hairline)] bg-card px-3"
                            style={{ width: LABEL_W }}
                          >
                            <span className="truncate text-[0.6875rem]">
                              {tk(`rooms.types.${type.id}`)}{" "}
                              <span className="nums text-muted-foreground">
                                {num(Number(room.number), {
                                  useGrouping: false,
                                })}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                room.housekeeping === "outOfService"
                                  ? "bg-[var(--destructive)]"
                                  : room.housekeeping === "dirty"
                                    ? "bg-[var(--warning)]"
                                    : "bg-[var(--success)]"
                              )}
                            />
                          </div>

                          <div className="relative flex border-b border-[var(--hairline)]">
                            {Array.from({ length: days }, (_, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "shrink-0 border-r border-[var(--hairline)]",
                                  [5, 6].includes(
                                    addDays(month, i).getUTCDay()
                                  ) && "bg-muted/35"
                                )}
                                style={{ width: DAY_W }}
                              />
                            ))}

                            {(byRoom.get(room.id) ?? []).map(
                              (booking, bookingIndex, list) => {
                                const next = list[bookingIndex + 1]
                                const gapDays = next
                                  ? Math.round(
                                      (new Date(
                                        next.reservation.checkIn
                                      ).getTime() -
                                        new Date(
                                          booking.reservation.checkOut
                                        ).getTime()) /
                                        86_400_000
                                    )
                                  : days
                                return (
                                  <BookingBar
                                    key={booking.reservation.id}
                                    booking={booking}
                                    month={month}
                                    days={days}
                                    gapDays={gapDays}
                                    dragging={
                                      drag?.id === booking.reservation.id
                                    }
                                  />
                                )
                              }
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}

          {/* Scrubber */}
          <div
            className="pointer-events-none absolute inset-y-0 z-40"
            style={{ left: LABEL_W + scrubDay * DAY_W + DAY_W / 2 }}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className="relative h-full"
            >
              <div
                className="absolute left-1/2 w-px -translate-x-1/2 bg-[var(--scrubber)]"
                style={{ top: ROW_H + 8, bottom: 0 }}
              />
              <div
                className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[var(--scrubber)]"
                style={{ top: ROW_H + 5 }}
              />
              <div className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[var(--scrubber)]" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[0.625rem] whitespace-nowrap text-background shadow-sm">
                {t("rooms.booked", { count: num(bookedOnScrubDay) })}
              </div>
            </motion.div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}

function BookingBar({
  booking,
  month,
  days,
  gapDays,
  dragging,
}: {
  booking: RackBooking
  month: Date
  days: number
  gapDays: number
  dragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: booking.reservation.id })

  const startOffset = Math.round(
    (new Date(booking.reservation.checkIn).getTime() - month.getTime()) /
      86_400_000
  )
  const endOffset = Math.round(
    (new Date(booking.reservation.checkOut).getTime() - month.getTime()) /
      86_400_000
  )
  const clampedStart = Math.max(0, startOffset)
  const clampedEnd = Math.min(days, endOffset)
  const width = (clampedEnd - clampedStart) * DAY_W - 6
  if (width <= 0) return null

  const wide = width > 70
  // Only spill the name outside the bar when the next stay is far enough away
  // to keep it from colliding, the way room-overview.jpg does.
  const showOutside = !wide && gapDays >= 3

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        left: clampedStart * DAY_W + 3,
        width,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        ["--tag" as string]: HUE_VAR[booking.hue],
      }}
      className={cn(
        "bar-tint absolute top-1/2 flex h-[19px] -translate-y-1/2 cursor-grab items-center rounded-full px-2 text-[0.625rem] font-medium transition-shadow select-none",
        (isDragging || dragging) &&
          "z-50 cursor-grabbing shadow-lg ring-1 ring-primary/40",
        booking.reservation.status === "pending" && "border-dashed"
      )}
      title={booking.guestName}
    >
      {wide ? <span className="truncate">{booking.guestName}</span> : null}
      {showOutside ? (
        <span className="pointer-events-none absolute left-[calc(100%+6px)] max-w-[110px] truncate text-[0.625rem] whitespace-nowrap text-muted-foreground">
          {booking.guestName}
        </span>
      ) : null}
    </div>
  )
}
