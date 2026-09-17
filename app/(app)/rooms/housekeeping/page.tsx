"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { motion } from "motion/react"
import { BedDouble, Clock, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Avatar } from "@/components/motion/avatar-stack"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag, HueDot } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type {
  HousekeepingTask,
  TagHue,
  TaskPriority,
  TaskState,
} from "@/lib/types"

const LANES: { id: TaskState; hue: TagHue }[] = [
  { id: "unassigned", hue: "slate" },
  { id: "inProgress", hue: "amber" },
  { id: "completed", hue: "green" },
]

const PRIORITY_HUE: Record<TaskPriority, TagHue> = {
  low: "slate",
  medium: "blue",
  high: "amber",
  critical: "rose",
}

export default function HousekeepingPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num } = useLocale()
  const [moves, setMoves] = React.useState<Record<string, TaskState>>({})
  const [dragging, setDragging] = React.useState<HousekeepingTask | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const tasks = React.useMemo(
    () =>
      data.housekeeping.map((task) =>
        moves[task.id] ? { ...task, state: moves[task.id] } : task
      ),
    [data.housekeeping, moves]
  )

  const byLane = React.useMemo(() => {
    const map = new Map<TaskState, HousekeepingTask[]>()
    for (const lane of LANES) map.set(lane.id, [])
    for (const task of tasks) map.get(task.state)?.push(task)
    return map
  }, [tasks])

  const kpis = React.useMemo(
    () => [
      {
        id: "total",
        label: t("rooms.housekeeping"),
        value: tasks.length,
        color: CHART_COLORS[0],
      },
      ...LANES.map((lane, index) => ({
        id: lane.id,
        label: t(`rooms.${lane.id}` as never),
        value: byLane.get(lane.id)?.length ?? 0,
        color: CHART_COLORS[index + 3],
      })),
    ],
    [tasks.length, byLane, t]
  )

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null)
    const lane = event.over?.id as TaskState | undefined
    const taskId = String(event.active.id)
    const task = tasks.find((candidate) => candidate.id === taskId)
    if (!lane || !task || task.state === lane) return
    setMoves((prev) => ({ ...prev, [taskId]: lane }))
    const room = lookups.room.get(task.roomId)
    toast.success(t(`rooms.${lane}` as never), {
      description: `${t("common.room")} ${room?.number ?? ""}`,
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("rooms.housekeeping")}
        subtitle={t("nav.groups.operations")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DndContext
          id="housekeeping-board"
          sensors={sensors}
          onDragStart={(event) =>
            setDragging(
              tasks.find((task) => task.id === String(event.active.id)) ?? null
            )
          }
          onDragEnd={onDragEnd}
          onDragCancel={() => setDragging(null)}
        >
          <div className="grid min-h-0 flex-1 gap-2.5 md:grid-cols-3">
            {LANES.map((lane) => (
              <Lane
                key={lane.id}
                lane={lane.id}
                hue={lane.hue}
                tasks={byLane.get(lane.id) ?? []}
              />
            ))}
          </div>
          <DragOverlay>
            {dragging ? (
              <div className="w-[260px] rotate-2">
                <TaskCard task={dragging} overlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

function Lane({
  lane,
  hue,
  tasks,
}: {
  lane: TaskState
  hue: TagHue
  tasks: HousekeepingTask[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: lane })
  const { t, num } = useLocale()
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 flex-col rounded-xl bg-surface transition-colors",
        isOver && "bg-primary/[0.07] ring-1 ring-primary/30"
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5">
        <HueDot hue={hue} />
        <span className="text-[0.6875rem] font-medium">
          {t(`rooms.${lane}` as never)}
        </span>
        <span className="nums rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
          {num(tasks.length)}
        </span>
        <span className="nums ml-auto flex items-center gap-1 text-[0.625rem] text-muted-foreground">
          <Clock className="size-2.5" />
          {num(Math.round(minutes / 60))}h
        </span>
      </div>
      <ScrollFade className="min-h-0 flex-1 px-2 pb-2">
        <div className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </ScrollFade>
    </div>
  )
}

function TaskCard({
  task,
  overlay = false,
}: {
  task: HousekeepingTask
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: overlay,
  })
  const lookups = useLookups()
  const { t, locale, num } = useLocale()
  const room = lookups.room.get(task.roomId)
  const assignee = task.assigneeId
    ? lookups.staff.get(task.assigneeId)
    : undefined

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      layout
      className={cn(
        "cursor-grab rounded-lg bg-card p-2.5 ring-1 ring-foreground/[0.08] active:cursor-grabbing",
        overlay && "shadow-lg",
        isDragging && "opacity-30"
      )}
    >
      <div className="flex items-center gap-2">
        <BedDouble className="size-3 text-muted-foreground" />
        <span className="nums text-[0.6875rem] font-medium">
          {room ? num(Number(room.number), { useGrouping: false }) : "—"}
        </span>
        <StatusTag hue="slate">
          {room ? t(`rooms.types.${room.typeId}` as never) : ""}
        </StatusTag>
        <StatusTag hue={PRIORITY_HUE[task.priority]} className="ml-auto">
          {t(`common.${task.priority}` as never)}
        </StatusTag>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[0.625rem] text-muted-foreground">
        <Sparkles className="size-2.5" />
        <span className="truncate">{task.note[locale]}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {assignee ? (
          <span className="flex items-center gap-1.5">
            <Avatar
              name={assignee.name[locale]}
              seed={assignee.avatarSeed}
              size={18}
            />
            <span className="truncate text-[0.625rem]">
              {assignee.name[locale]}
            </span>
          </span>
        ) : (
          <span className="text-[0.625rem] text-muted-foreground">
            {t("rooms.unassigned")}
          </span>
        )}
        <span className="nums ml-auto text-[0.625rem] text-muted-foreground">
          {num(task.minutes)}m
        </span>
      </div>
    </motion.div>
  )
}
