"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  BedDouble,
  CalendarRange,
  Hand,
  Languages,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Play,
  Sparkles,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { StreamingText } from "@/components/motion/streaming-text"
import { Meter, Waveform } from "@/components/motion/waveform"
import { cn } from "@/lib/utils"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { demoToday } from "@/lib/demo-time"
import { LIVE_CALL_SCRIPTS } from "@/lib/mock/calls"
import type { CallTurn } from "@/lib/types"

/** Entities the agent extracts as the call unfolds, keyed to a turn index. */
const EXTRACTED: { atTurn: number; labelKey: string; value: string }[] = [
  { atTurn: 2, labelKey: "bookings.checkInDate", value: "19" },
  { atTurn: 4, labelKey: "common.nights", value: "3" },
  { atTurn: 6, labelKey: "common.adults", value: "2" },
  { atTurn: 7, labelKey: "bookings.roomType", value: "deluxe" },
  { atTurn: 7, labelKey: "common.room", value: "912" },
  { atTurn: 10, labelKey: "common.name", value: "Tanvir Hossain" },
]

export default function CallsPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, relative, duration, date } = useLocale()

  const [language, setLanguage] = React.useState<"bn" | "en">("bn")
  const [playing, setPlaying] = React.useState(false)
  const [turnIndex, setTurnIndex] = React.useState(-1)
  const [elapsed, setElapsed] = React.useState(0)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const transcriptEnd = React.useRef<HTMLDivElement>(null)

  const script: CallTurn[] = LIVE_CALL_SCRIPTS[language]
  const call = data.calls.find(
    (c) => c.id === (language === "bn" ? "call_live_bn" : "call_live_en")
  )
  const caller = call ? lookups.guest.get(call.guestId) : undefined

  const stop = React.useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const play = React.useCallback(() => {
    stop()
    setPlaying(true)
    setTurnIndex(-1)
    setElapsed(0)
    script.forEach((turn, index) => {
      timers.current.push(
        setTimeout(() => {
          setTurnIndex(index)
          setElapsed(Math.round(turn.atMs / 1000))
          if (index === script.length - 1) {
            timers.current.push(
              setTimeout(() => {
                setPlaying(false)
                toast.success(t("inbox.bookingCreated"))
              }, 1400)
            )
          }
        }, turn.atMs)
      )
    })
  }, [script, stop, t])

  React.useEffect(() => stop, [stop])
  React.useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [turnIndex])

  const shown = script.slice(0, turnIndex + 1)
  const current = script[turnIndex]
  const aiSpeaking = current?.speaker === "ai"
  const extracted = EXTRACTED.filter((entity) => entity.atTurn <= turnIndex)
  const progress = script.length ? (turnIndex + 1) / script.length : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("calls.title")} subtitle={t("calls.handledByAi")}>
        <SegmentedPills
          size="sm"
          value={language}
          onChange={(value) => {
            stop()
            setPlaying(false)
            setTurnIndex(-1)
            setLanguage(value)
          }}
          options={[
            {
              value: "bn",
              label: "বাংলা",
              icon: <Languages className="size-3" />,
            },
            { value: "en", label: "English" },
          ]}
        />
        <Button size="sm" onClick={play} disabled={playing}>
          <Play />
          {t("calls.playScriptedCall")}
        </Button>
      </PageHeader>

      <div className="grid min-h-0 flex-1 gap-3 px-5 pb-5 lg:grid-cols-[260px_1.4fr_300px]">
        {/* Call list */}
        <Panel
          title={t("calls.recentCalls")}
          bodyClassName="px-0"
          className="min-h-0"
        >
          <ScrollFade className="h-full px-2">
            {data.calls.slice(0, 16).map((record) => {
              const guest = lookups.guest.get(record.guestId)
              const isLive = record.id.startsWith("call_live")
              return (
                <div
                  key={record.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                    isLive ? "bg-primary/8" : "hover:bg-muted/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      record.outcome === "booked"
                        ? "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]"
                        : record.outcome === "escalated"
                          ? "bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-[var(--warning)]"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    <PhoneIncoming className="size-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.6875rem] font-medium">
                      {guest?.name[locale] ?? "—"}
                    </div>
                    <div className="truncate text-[0.625rem] text-muted-foreground">
                      {record.intent[locale]}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="nums text-[0.625rem] text-muted-foreground">
                      {duration(record.durationSeconds)}
                    </span>
                    <span className="text-[0.5625rem] text-muted-foreground">
                      {record.language === "bn" ? "বাং" : "EN"}
                    </span>
                  </div>
                </div>
              )
            })}
          </ScrollFade>
        </Panel>

        {/* Live call */}
        <Panel
          title={
            <span className="flex items-center gap-1.5">
              {playing ? (
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--destructive)]" />
              ) : null}
              {playing ? t("calls.liveCall") : t("calls.incoming")}
            </span>
          }
          subtitle={
            caller ? `${caller.name[locale]} · ${caller.phone}` : undefined
          }
          className="min-h-0"
          bodyClassName="flex flex-col min-h-0"
          delay={0.05}
          actions={
            <span className="nums rounded-full bg-muted px-2 py-0.5 text-[0.625rem] text-muted-foreground">
              {duration(elapsed)}
            </span>
          }
        >
          <div className="rounded-lg bg-surface px-3 py-3">
            <Waveform active={playing} bars={56} height={36} />
            <div className="mt-2 flex items-center justify-center gap-2 text-[0.625rem] text-muted-foreground">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors",
                  playing && aiSpeaking && "bg-primary/12 text-primary"
                )}
              >
                <Sparkles className="size-2.5" />
                {t("calls.aiSpeaking")}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors",
                  playing && !aiSpeaking && "bg-muted text-foreground"
                )}
              >
                <User className="size-2.5" />
                {t("calls.callerSpeaking")}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="micro shrink-0">{t("calls.transcript")}</span>
            <span className="h-px flex-1 bg-[var(--hairline)]" />
            <StatusTag hue={language === "bn" ? "magenta" : "blue"}>
              {language === "bn" ? "বাংলা" : "English"}
            </StatusTag>
          </div>

          <ScrollFade className="mt-2 min-h-0 flex-1">
            <div className="flex flex-col gap-2.5 pr-1">
              <AnimatePresence initial={false}>
                {shown.map((turn, index) => (
                  <motion.div
                    key={turn.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex max-w-[88%] flex-col gap-1",
                      turn.speaker === "ai"
                        ? "self-start"
                        : "items-end self-end"
                    )}
                  >
                    <span className="micro">
                      {turn.speaker === "ai"
                        ? t("common.ai")
                        : caller?.name[locale]}
                    </span>
                    <div
                      className={cn(
                        "rounded-xl px-3 py-2 text-xs leading-relaxed",
                        turn.speaker === "ai"
                          ? "rounded-tl-sm bg-primary/10 ring-1 ring-primary/25"
                          : "rounded-tr-sm bg-card ring-1 ring-foreground/[0.08]"
                      )}
                    >
                      {index === turnIndex ? (
                        <StreamingText
                          text={turn.text[locale]}
                          charsPerTick={2}
                          minDelay={10}
                          maxDelay={26}
                        />
                      ) : (
                        turn.text[locale]
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {turnIndex < 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <PhoneCall className="size-5 text-muted-foreground" />
                  <p className="text-[0.6875rem] text-muted-foreground">
                    {t("calls.playScriptedCall")}
                  </p>
                </div>
              ) : null}
              <div ref={transcriptEnd} />
            </div>
          </ScrollFade>

          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stop()
                setPlaying(false)
                toast(t("calls.bargeIn"))
              }}
            >
              <Hand />
              {t("calls.bargeIn")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                stop()
                setPlaying(false)
              }}
            >
              <PhoneOff />
              {t("calls.endCall")}
            </Button>
            <Meter
              value={call?.sentiment ?? 0.5}
              label={t("calls.sentiment")}
              tone={(call?.sentiment ?? 0) > 0.6 ? "success" : "warning"}
              className="ml-auto w-[150px]"
            />
          </div>
        </Panel>

        {/* Auto-filling reservation */}
        <Panel
          title={t("calls.autoFilling")}
          subtitle={t("calls.intent") + " · " + (call?.intent[locale] ?? "")}
          className="min-h-0"
          delay={0.1}
        >
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              animate={{ width: `${Math.max(0, progress) * 100}%` }}
              transition={{ type: "spring", stiffness: 220, damping: 30 }}
              className="h-full rounded-full bg-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            {EXTRACTED.map((entity) => {
              const filled = extracted.includes(entity)
              const raw = entity.value
              const display =
                entity.labelKey === "bookings.roomType"
                  ? t(`rooms.types.${raw}` as never)
                  : /^\d+$/.test(raw)
                    ? num(Number(raw), { useGrouping: false })
                    : raw
              return (
                <div
                  key={entity.labelKey + entity.value}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition-colors",
                    filled
                      ? "bg-card ring-1 ring-foreground/[0.08]"
                      : "bg-surface opacity-50"
                  )}
                >
                  <span className="micro">{t(entity.labelKey as never)}</span>
                  <AnimatePresence mode="wait">
                    {filled ? (
                      <motion.span
                        key="value"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="nums text-[0.6875rem] font-medium"
                      >
                        {display}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="blank"
                        className="h-2 w-10 rounded-full bg-muted"
                      />
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <AnimatePresence>
            {progress >= 1 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="mt-3 overflow-hidden rounded-xl bg-card ring-1 ring-[color-mix(in_oklch,var(--success)_35%,transparent)]"
              >
                <div className="flex items-center gap-1.5 bg-[color-mix(in_oklch,var(--success)_12%,transparent)] px-3 py-1.5">
                  <BedDouble className="size-3 text-[var(--success)]" />
                  <span className="text-[0.625rem] font-medium text-[var(--success)]">
                    {t("bookings.bookingConfirmed")}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="flex items-center gap-1.5 text-[0.625rem] text-muted-foreground">
                    <CalendarRange className="size-3" />
                    {date(demoToday(), { day: "numeric", month: "short" })}
                  </span>
                  <span className="nums text-sm font-medium">
                    {money.format(61400)}
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {caller ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface p-2.5">
              <Avatar
                name={caller.name[locale]}
                seed={caller.avatarSeed}
                size={28}
              />
              <div className="min-w-0">
                <div className="truncate text-[0.6875rem] font-medium">
                  {caller.name[locale]}
                </div>
                <div className="nums truncate text-[0.625rem] text-muted-foreground">
                  {num(caller.stays)} {t("frontDesk.totalStays").toLowerCase()}{" "}
                  · {money.compact(caller.lifetimeValue)}
                </div>
              </div>
              <span className="ml-auto shrink-0 text-[0.625rem] text-muted-foreground">
                {call ? relative(call.startedAt) : null}
              </span>
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  )
}
