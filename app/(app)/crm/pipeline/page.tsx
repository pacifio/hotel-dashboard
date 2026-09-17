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
  type DragStartEvent,
} from "@dnd-kit/core"
import { AnimatePresence, motion } from "motion/react"
import {
  Building2,
  CalendarDays,
  KanbanSquare,
  Plus,
  Sparkles,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { PageHeader } from "@/components/motion/card-shell"
import { CompoundFilter } from "@/components/motion/segmented"
import { NumberTicker } from "@/components/motion/number-ticker"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag, HueDot } from "@/components/motion/status-tag"
import { StreamingText } from "@/components/motion/streaming-text"
import { cn } from "@/lib/utils"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Deal, DealStage } from "@/lib/types"

const STAGES: {
  id: DealStage
  hue: "slate" | "blue" | "amber" | "purple" | "green" | "rose"
}[] = [
  { id: "enquiry", hue: "slate" },
  { id: "proposal", hue: "blue" },
  { id: "negotiation", hue: "amber" },
  { id: "contracted", hue: "purple" },
  { id: "won", hue: "green" },
  { id: "lost", hue: "rose" },
]

export default function PipelinePage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, date, pct } = useLocale()

  const [moves, setMoves] = React.useState<Record<string, DealStage>>({})
  const [dragging, setDragging] = React.useState<Deal | null>(null)
  const [openDeal, setOpenDeal] = React.useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const deals = React.useMemo(
    () =>
      data.deals.map((deal) =>
        moves[deal.id] ? { ...deal, stage: moves[deal.id] } : deal
      ),
    [data.deals, moves]
  )

  const byStage = React.useMemo(() => {
    const map = new Map<DealStage, Deal[]>()
    for (const stage of STAGES) map.set(stage.id, [])
    for (const deal of deals) map.get(deal.stage)?.push(deal)
    return map
  }, [deals])

  const totalValue = deals
    .filter((deal) => !["won", "lost"].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.value, 0)

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null)
    const stage = event.over?.id as DealStage | undefined
    const dealId = String(event.active.id)
    const deal = deals.find((d) => d.id === dealId)
    if (!stage || !deal || deal.stage === stage) return
    setMoves((prev) => ({ ...prev, [dealId]: stage }))
    toast.success(
      t("crm.dealMoved", {
        deal: deal.title[locale],
        stage: t(`crm.stages.${stage}` as never),
      })
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("crm.pipeline")}
        subtitle={`${t("crm.pipelineValue")} · ${money.format(totalValue)}`}
      >
        <CompoundFilter label={t("common.sortBy")}>
          {t("crm.pipelineValue")}
        </CompoundFilter>
        <CompoundFilter label={t("common.filter")}>
          {t("crm.allOwners")}
        </CompoundFilter>
        <Button size="sm">
          <Plus />
          {t("crm.deals")}
        </Button>
      </PageHeader>

      <DndContext
        id="deal-pipeline"
        sensors={sensors}
        onDragStart={(event: DragStartEvent) =>
          setDragging(
            deals.find((d) => d.id === String(event.active.id)) ?? null
          )
        }
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragging(null)}
      >
        <div className="flex min-h-0 flex-1 gap-2.5 overflow-x-auto px-5 pb-5">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage.id}
              hue={stage.hue}
              deals={byStage.get(stage.id) ?? []}
              onOpen={setOpenDeal}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: "cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {dragging ? (
            <div className="w-[248px] rotate-2">
              <DealCard deal={dragging} overlay onOpen={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Deal detail drawer */}
      <AnimatePresence>
        {openDeal ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenDeal(null)}
              className="fixed inset-0 z-40 bg-black/35"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[400px] flex-col border-l border-[var(--hairline)] bg-background"
            >
              <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3">
                <KanbanSquare className="size-3.5 text-muted-foreground" />
                <span className="truncate text-xs font-medium">
                  {openDeal.title[locale]}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto"
                  onClick={() => setOpenDeal(null)}
                >
                  <X />
                </Button>
              </header>
              <ScrollFade className="min-h-0 flex-1 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    label={t("crm.pipelineValue")}
                    value={money.format(openDeal.value)}
                  />
                  <Stat
                    label={t("crm.roomNights")}
                    value={num(openDeal.roomNights)}
                  />
                  <Stat
                    label={t("common.status")}
                    value={t(`crm.stages.${openDeal.stage}` as never)}
                  />
                  <Stat
                    label={t("common.date")}
                    value={date(openDeal.closeDate)}
                  />
                </div>

                <div className="mt-4 rounded-lg bg-surface p-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-primary" />
                    <span className="text-[0.6875rem] font-medium">
                      {t("crm.nextBestAction")}
                    </span>
                    <StatusTag hue="blue" className="ml-auto">
                      {t("crm.aiDrafted")}
                    </StatusTag>
                  </div>
                  <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
                    <StreamingText
                      text={openDeal.aiNextAction[locale]}
                      charsPerTick={3}
                      cursor={false}
                    />
                  </p>
                </div>

                <div className="mt-4">
                  <div className="micro pb-2">{t("crm.companies")}</div>
                  <div className="flex items-center gap-2 rounded-lg bg-card p-2.5 ring-1 ring-foreground/[0.08]">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span className="text-[0.6875rem] font-medium">
                      {lookups.company.get(openDeal.companyId)?.name}
                    </span>
                    <span className="nums ml-auto text-[0.625rem] text-muted-foreground">
                      {pct(openDeal.probability, 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="micro pb-2">{t("crm.lastActivity")}</div>
                  <div className="relative flex flex-col gap-3 pl-4">
                    <span className="absolute inset-y-1 left-[3px] w-px bg-[var(--hairline)]" />
                    {[
                      { at: openDeal.createdAt, key: "crm.stages.enquiry" },
                      { at: openDeal.closeDate, key: "crm.stages.proposal" },
                      {
                        at: openDeal.closeDate,
                        key: `crm.stages.${openDeal.stage}`,
                      },
                    ].map((event, index) => (
                      <div key={index} className="relative">
                        <span className="absolute top-1 -left-4 size-[7px] rounded-full bg-primary ring-2 ring-background" />
                        <div className="text-[0.6875rem]">
                          {t(event.key as never)}
                        </div>
                        <div className="nums text-[0.625rem] text-muted-foreground">
                          {date(event.at, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollFade>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function StageColumn({
  stage,
  hue,
  deals,
  onOpen,
}: {
  stage: DealStage
  hue: "slate" | "blue" | "amber" | "purple" | "green" | "rose"
  deals: Deal[]
  onOpen: (deal: Deal) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const { t, num } = useLocale()
  const money = useMoney()
  const total = deals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[264px] shrink-0 flex-col rounded-xl bg-surface transition-colors",
        isOver && "bg-primary/[0.07] ring-1 ring-primary/30"
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5">
        <HueDot hue={hue} />
        <span className="text-[0.6875rem] font-medium">
          {t(`crm.stages.${stage}` as never)}
        </span>
        <span className="nums rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
          {num(deals.length)}
        </span>
        <span className="nums ml-auto text-[0.625rem] text-muted-foreground">
          <NumberTicker
            value={total}
            prefix={money.symbol}
            format={{ notation: "compact", maximumFractionDigits: 1 }}
          />
        </span>
      </div>
      <ScrollFade className="min-h-0 flex-1 px-2 pb-2">
        <div className="flex flex-col gap-1.5">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onOpen={onOpen} />
          ))}
        </div>
      </ScrollFade>
    </div>
  )
}

function DealCard({
  deal,
  overlay = false,
  onOpen,
}: {
  deal: Deal
  overlay?: boolean
  onOpen: (deal: Deal) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
    disabled: overlay,
  })
  const lookups = useLookups()
  const money = useMoney()
  const { locale, num, date, t } = useLocale()
  const company = lookups.company.get(deal.companyId)
  const owner = lookups.staff.get(deal.ownerId)

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(deal)}
      className={cn(
        "cursor-grab rounded-lg bg-card p-2.5 ring-1 ring-foreground/[0.08] transition-shadow active:cursor-grabbing",
        overlay ? "shadow-lg" : "hover:ring-foreground/20",
        isDragging && "opacity-30"
      )}
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 text-[0.6875rem] leading-snug font-medium">
          {deal.title[locale]}
        </span>
        {company ? (
          <StatusTag hue={company.hue}>
            {t(`crm.segments.${company.segment}` as never)}
          </StatusTag>
        ) : null}
      </div>
      <div className="mt-1.5 truncate text-[0.625rem] text-muted-foreground">
        {company?.name}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="nums text-[0.6875rem] font-medium">
          {money.compact(deal.value)}
        </span>
        <span className="nums flex items-center gap-1 text-[0.625rem] text-muted-foreground">
          <CalendarDays className="size-2.5" />
          {date(deal.closeDate)}
        </span>
        {owner ? (
          <Avatar
            name={owner.name[locale]}
            seed={owner.avatarSeed}
            size={18}
            className="ml-auto"
          />
        ) : null}
      </div>
      <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${deal.probability}%` }}
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-2.5">
      <div className="micro">{label}</div>
      <div className="nums mt-1 text-xs font-medium">{value}</div>
    </div>
  )
}
