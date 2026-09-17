"use client"

import * as React from "react"
import { Group, Panel, Separator } from "react-resizable-panels"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowUp,
  BedDouble,
  Bot,
  CalendarCheck,
  Inbox as InboxIcon,
  Info,
  Search,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar } from "@/components/motion/avatar-stack"
import { EmptyState } from "@/components/motion/card-shell"
import { Meter } from "@/components/motion/waveform"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { StreamingText, ThinkingDots } from "@/components/motion/streaming-text"
import { ChannelBadge, CHANNEL_HUE } from "@/components/icons/channel-icons"
import { cn } from "@/lib/utils"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"
import { routeReply } from "@/lib/ai/inbox-replies"
import type { ChannelId, Conversation, Message } from "@/lib/types"

const CHANNELS: ChannelId[] = [
  "whatsapp",
  "messenger",
  "instagram",
  "sms",
  "email",
  "voice",
  "webchat",
]

type Filter = "all" | "unread" | "aiHandled" | "needsHuman"

export default function InboxPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, relative, time, duration, digits } = useLocale()
  const autopilotOverrides = useUi((state) => state.autopilotOverrides)
  const setAutopilot = useUi((state) => state.setAutopilot)

  const [channel, setChannel] = React.useState<ChannelId | "all">("all")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const defaultThreadId = React.useMemo(
    () =>
      // Land on the hand-written booking thread rather than whichever filler
      // conversation happens to be most recent.
      (
        data.conversations.find((c) => c.id === "conv_1") ??
        data.conversations[0]
      )?.id,
    [data.conversations]
  )
  const [activeId, setActiveId] = React.useState(defaultThreadId)
  /** Messages the demo user (or the autopilot) adds during the session. */
  const [extra, setExtra] = React.useState<Record<string, Message[]>>({})
  const [pending, setPending] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const [showInfo, setShowInfo] = React.useState(true)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setActiveId(defaultThreadId)
    setExtra({})
  }, [defaultThreadId])

  const channelCounts = React.useMemo(() => {
    const counts = new Map<ChannelId, number>()
    for (const conversation of data.conversations) {
      counts.set(
        conversation.channel,
        (counts.get(conversation.channel) ?? 0) + 1
      )
    }
    return counts
  }, [data.conversations])

  const threads = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return data.conversations.filter((conversation) => {
      if (channel !== "all" && conversation.channel !== channel) return false
      if (filter === "unread" && conversation.unread === 0) return false
      if (filter === "aiHandled" && conversation.state !== "aiHandled")
        return false
      if (filter === "needsHuman" && conversation.state !== "needsHuman")
        return false
      if (!normalized) return true
      const guest = lookups.guest.get(conversation.guestId)
      return (
        conversation.subject.en.toLowerCase().includes(normalized) ||
        conversation.subject.bn.includes(normalized) ||
        guest?.name.en.toLowerCase().includes(normalized) ||
        guest?.name.bn.includes(normalized)
      )
    })
  }, [data.conversations, channel, filter, query, lookups])

  const active = React.useMemo(
    () => data.conversations.find((c) => c.id === activeId),
    [data.conversations, activeId]
  )

  const messages = React.useMemo(
    () => (active ? [...active.messages, ...(extra[active.id] ?? [])] : []),
    [active, extra]
  )

  const autopilotOn = active
    ? (autopilotOverrides[active.id] ?? active.autopilot)
    : false

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length, pending])

  const send = () => {
    if (!active || !draft.trim()) return
    const text = draft.trim()
    setDraft("")
    const outbound: Message = {
      id: `sent_${Date.now()}`,
      author: "agent",
      body: { en: text, bn: text },
      at: new Date().toISOString(),
    }
    setExtra((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), outbound],
    }))
    if (!autopilotOn) return

    // Autopilot: a beat of "typing", then a streamed reply with its confidence.
    setPending(active.id)
    const reply = routeReply(text)
    setTimeout(() => {
      setPending(null)
      setExtra((prev) => ({
        ...prev,
        [active.id]: [
          ...(prev[active.id] ?? []),
          {
            id: `ai_${Date.now()}`,
            author: "ai",
            body: reply.body,
            at: new Date().toISOString(),
            confidence: reply.confidence,
            attachment: reply.attachment,
          },
        ],
      }))
      if (reply.attachment?.kind === "booking") {
        toast.success(t("inbox.bookingCreated"))
      }
    }, 1500)
  }

  const guest = active ? lookups.guest.get(active.guestId) : undefined
  const guestStays = React.useMemo(
    () =>
      active
        ? data.reservations
            .filter((r) => r.guestId === active.guestId)
            .slice(0, 4)
        : [],
    [data.reservations, active]
  )

  return (
    <div className="flex min-h-0 flex-1">
      {/* Channel rail */}
      <aside className="flex w-[11.625rem] shrink-0 flex-col border-r border-[var(--hairline)] bg-surface">
        <div className="flex h-11 items-center gap-2 border-b border-[var(--hairline)] px-3">
          <InboxIcon className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{t("inbox.title")}</span>
          <span className="nums ml-auto rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
            {num(data.conversations.length)}
          </span>
        </div>
        <ScrollFade className="min-h-0 flex-1 p-2">
          <button
            onClick={() => setChannel("all")}
            className={cn(
              "flex h-7 w-full items-center gap-2 rounded-md px-2 text-[0.6875rem] transition-colors",
              channel === "all"
                ? "bg-sidebar-accent font-medium"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <InboxIcon className="size-3.5" />
            {t("inbox.allChannels")}
          </button>
          <div className="micro px-2 pt-3 pb-1.5">
            {t("nav.groups.omnichannel")}
          </div>
          {CHANNELS.map((id) => (
            <button
              key={id}
              onClick={() => setChannel(id)}
              className={cn(
                "flex h-7 w-full items-center gap-2 rounded-md px-2 text-[0.6875rem] transition-colors",
                channel === id
                  ? "bg-sidebar-accent font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <span style={{ color: `var(--hue-${CHANNEL_HUE[id]})` }}>
                <ChannelBadge channel={id} size={16} />
              </span>
              <span className="flex-1 truncate text-left">
                {t(`inbox.channels.${id}` as never)}
              </span>
              <span className="nums text-[0.625rem] opacity-70">
                {num(channelCounts.get(id) ?? 0)}
              </span>
            </button>
          ))}
        </ScrollFade>
      </aside>

      <Group orientation="horizontal" className="min-w-0 flex-1">
        {/* Thread list */}
        <Panel id="threads" defaultSize="26%" minSize="18%" maxSize="40%">
          <div className="flex h-full flex-col border-r border-[var(--hairline)]">
            <div className="flex h-11 items-center gap-2 border-b border-[var(--hairline)] px-3">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("common.search")}
                  className="h-7 w-full rounded-full border border-border bg-card pr-2.5 pl-7 text-[0.6875rem] outline-none focus-visible:border-ring"
                />
              </div>
            </div>
            <div className="border-b border-[var(--hairline)] px-2 py-1.5">
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "unread", label: t("inbox.unread") },
                  { value: "aiHandled", label: t("inbox.aiHandled") },
                  { value: "needsHuman", label: t("inbox.needsHuman") },
                ]}
              />
            </div>
            <ScrollFade className="min-h-0 flex-1">
              {threads.map((conversation) => (
                <ThreadRow
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  onSelect={() => setActiveId(conversation.id)}
                  guestName={
                    lookups.guest.get(conversation.guestId)?.name[locale] ?? "—"
                  }
                  locale={locale}
                  relative={relative}
                  duration={duration}
                  num={num}
                  t={t}
                />
              ))}
              {threads.length === 0 ? (
                <EmptyState
                  icon={<Search />}
                  title={t("common.noResults")}
                  hint={t("common.noResultsHint")}
                />
              ) : null}
            </ScrollFade>
          </div>
        </Panel>

        <Separator className="w-px bg-[var(--hairline)] transition-colors data-[separator]:hover:bg-primary/40" />

        {/* Conversation */}
        <Panel id="conversation" minSize="30%">
          {active && guest ? (
            <div className="flex h-full flex-col">
              <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3">
                <ChannelBadge channel={active.channel} size={22} />
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">
                    {guest.name[locale]}
                  </div>
                  <div className="truncate text-[0.625rem] text-muted-foreground">
                    {active.subject[locale]}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-border px-2 py-1">
                    <Bot
                      className={cn(
                        "size-3",
                        autopilotOn ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-[0.625rem] whitespace-nowrap">
                      {autopilotOn
                        ? t("inbox.autopilotOn")
                        : t("inbox.autopilotOff")}
                    </span>
                    <Switch
                      checked={autopilotOn}
                      onCheckedChange={(checked) => {
                        setAutopilot(active.id, checked)
                        if (!checked) {
                          toast(t("inbox.handedOff", { name: "Nusrat Rahman" }))
                        }
                      }}
                    />
                  </span>
                  <Button
                    variant={showInfo ? "secondary" : "outline"}
                    size="sm"
                    aria-pressed={showInfo}
                    title={t(showInfo ? "inbox.hideInfo" : "inbox.showInfo")}
                    onClick={() => setShowInfo((value) => !value)}
                  >
                    <Info />
                    {t("inbox.info")}
                  </Button>
                </div>
              </header>

              <ScrollFade className="min-h-0 flex-1 px-4 py-4">
                <div className="mx-auto flex max-w-[620px] flex-col gap-3">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      guestName={guest.name[locale]}
                      locale={locale}
                      time={time}
                      money={money}
                      t={t}
                      num={num}
                      digits={digits}
                    />
                  ))}
                  <AnimatePresence>
                    {pending === active.id ? (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 self-start rounded-xl bg-surface px-3 py-2 ring-1 ring-primary/20"
                      >
                        <Bot className="size-3 text-primary" />
                        <ThinkingDots />
                        <span className="text-[0.625rem] text-muted-foreground">
                          {t("inbox.typing")}
                        </span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>
              </ScrollFade>

              <div className="shrink-0 border-t border-[var(--hairline)] p-3">
                <div className="mx-auto max-w-[620px]">
                  {autopilotOn ? (
                    <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/8 px-2.5 py-1.5">
                      <Sparkles className="size-3 shrink-0 text-primary" />
                      <span className="truncate text-[0.625rem] text-muted-foreground">
                        {t("inbox.autopilotOn")} ·{" "}
                        {t("inbox.slaBreach", {
                          time: duration(active.slaSeconds),
                        })}
                      </span>
                    </div>
                  ) : null}
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      send()
                    }}
                    className="flex items-end gap-2 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 focus-within:ring-primary/40"
                  >
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault()
                          send()
                        }
                      }}
                      rows={1}
                      placeholder={t("inbox.replyPlaceholder")}
                      className="max-h-24 min-h-7 flex-1 resize-none bg-transparent px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
                    />
                    <Button type="submit" size="icon" disabled={!draft.trim()}>
                      <ArrowUp />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<InboxIcon />}
              title={t("inbox.noConversation")}
              hint={t("inbox.noConversationHint")}
            />
          )}
        </Panel>

        {showInfo ? (
          <Separator className="w-px bg-[var(--hairline)] transition-colors data-[separator]:hover:bg-primary/40" />
        ) : null}

        {/* Guest 360 — toggled from the Info button in the conversation header */}
        {showInfo ? (
          <Panel id="guest" defaultSize="22%" minSize="16%" maxSize="32%">
            {guest ? (
              <ScrollFade className="h-full border-l border-[var(--hairline)] bg-surface">
                <div className="flex h-11 items-center border-b border-[var(--hairline)] px-3">
                  <span className="text-xs font-medium">
                    {t("inbox.guest360")}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 border-b border-[var(--hairline)] p-4">
                  <Avatar
                    name={guest.name[locale]}
                    seed={guest.avatarSeed}
                    size={44}
                  />
                  <div className="text-center">
                    <div className="text-xs font-medium">
                      {guest.name[locale]}
                    </div>
                    <div className="text-[0.625rem] text-muted-foreground">
                      {guest.nationality[locale]} · {guest.phone}
                    </div>
                  </div>
                  <StatusTag
                    hue={
                      guest.tier === "platinum"
                        ? "purple"
                        : guest.tier === "gold"
                          ? "amber"
                          : guest.tier === "silver"
                            ? "slate"
                            : "teal"
                    }
                    dot
                  >
                    {t(`crm.tiers.${guest.tier}` as never)}
                  </StatusTag>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[var(--hairline)] border-b border-[var(--hairline)]">
                  <div className="p-3">
                    <div className="micro">{t("frontDesk.totalStays")}</div>
                    <div className="figure mt-1 text-lg">
                      {num(guest.stays)}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="micro">{t("frontDesk.lifetimeValue")}</div>
                    <div className="figure mt-1 truncate text-lg">
                      {money.compact(guest.lifetimeValue)}
                    </div>
                  </div>
                </div>

                <div className="border-b border-[var(--hairline)] p-3">
                  <div className="micro pb-2">{t("inbox.preferences")}</div>
                  <div className="flex flex-wrap gap-1">
                    {guest.preferences.map((preference, index) => (
                      <StatusTag key={index} hue="blue">
                        {preference[locale]}
                      </StatusTag>
                    ))}
                  </div>
                </div>

                <div className="p-3">
                  <div className="micro pb-2">{t("inbox.pastStays")}</div>
                  <div className="flex flex-col gap-1.5">
                    {guestStays.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex items-center gap-2 rounded-md bg-card px-2 py-1.5 ring-1 ring-foreground/[0.06]"
                      >
                        <BedDouble className="size-3 shrink-0 text-muted-foreground" />
                        <span className="nums truncate text-[0.625rem]">
                          {reservation.code}
                        </span>
                        <span className="nums ml-auto shrink-0 text-[0.625rem] text-muted-foreground">
                          {money.compact(reservation.total)}
                        </span>
                      </div>
                    ))}
                    {guestStays.length === 0 ? (
                      <span className="text-[0.625rem] text-muted-foreground">
                        {t("common.none")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ScrollFade>
            ) : null}
          </Panel>
        ) : null}
      </Group>
    </div>
  )
}

function ThreadRow({
  conversation,
  active,
  onSelect,
  guestName,
  locale,
  relative,
  duration,
  num,
  t,
}: {
  conversation: Conversation
  active: boolean
  onSelect: () => void
  guestName: string
  locale: "en" | "bn"
  relative: (value: string) => string
  duration: (seconds: number) => string
  num: (value: number) => string
  t: (key: never) => string
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex w-full gap-2.5 border-b border-[var(--hairline)] px-3 py-2.5 text-left transition-colors",
        active ? "bg-sidebar-accent" : "hover:bg-muted/60"
      )}
    >
      {active ? (
        <motion.span
          layoutId="thread-rail"
          transition={{ type: "spring", stiffness: 520, damping: 40 }}
          className="absolute inset-y-0 left-0 w-0.5 bg-primary"
        />
      ) : null}
      <ChannelBadge channel={conversation.channel} size={26} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "truncate text-[0.6875rem]",
              conversation.unread > 0 ? "font-semibold" : "font-medium"
            )}
          >
            {guestName}
          </span>
          <span className="ml-auto shrink-0 text-[0.625rem] whitespace-nowrap text-muted-foreground">
            {relative(conversation.updatedAt)}
          </span>
        </div>
        <div className="truncate text-[0.625rem] text-muted-foreground">
          {conversation.subject[locale]}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {conversation.state === "aiHandled" ? (
            <StatusTag hue="blue">
              <Bot className="size-2" />
              {t("inbox.aiHandled" as never)}
            </StatusTag>
          ) : conversation.state === "needsHuman" ? (
            <StatusTag hue="amber">{t("inbox.needsHuman" as never)}</StatusTag>
          ) : (
            <StatusTag hue="green">{t("inbox.resolved" as never)}</StatusTag>
          )}
          {conversation.slaSeconds < 3600 ? (
            <span className="nums text-[0.5625rem] text-[var(--warning)]">
              {duration(conversation.slaSeconds)}
            </span>
          ) : null}
          {conversation.unread > 0 ? (
            <span className="nums ml-auto flex size-4 items-center justify-center rounded-full bg-primary text-[0.5625rem] font-medium text-primary-foreground">
              {num(conversation.unread)}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function MessageBubble({
  message,
  guestName,
  locale,
  time,
  money,
  t,
  num,
  digits,
}: {
  message: Message
  guestName: string
  locale: "en" | "bn"
  time: (value: string) => string
  money: ReturnType<typeof useMoney>
  t: (key: never) => string
  num: (value: number) => string
  digits: (value: string) => string
}) {
  const fromGuest = message.author === "guest"
  const isAi = message.author === "ai"
  const isSystem = message.author === "system"
  const [streamed, setStreamed] = React.useState(!message.id.startsWith("ai_"))

  if (isSystem) {
    return (
      <div className="self-center rounded-full bg-muted px-2.5 py-1 text-[0.625rem] text-muted-foreground">
        {message.body[locale]}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "flex max-w-[86%] flex-col gap-1",
        fromGuest ? "self-start" : "items-end self-end"
      )}
    >
      <div
        className={cn(
          "rounded-xl px-3 py-2 text-xs leading-relaxed",
          fromGuest
            ? "rounded-tl-sm bg-card ring-1 ring-foreground/[0.08]"
            : isAi
              ? "rounded-tr-sm bg-primary/10 ring-1 ring-primary/25"
              : "rounded-tr-sm bg-primary text-primary-foreground"
        )}
      >
        {isAi && !streamed ? (
          <StreamingText
            text={message.body[locale]}
            onDone={() => setStreamed(true)}
          />
        ) : (
          message.body[locale]
        )}
      </div>

      {message.attachment ? (
        <AttachmentCard
          attachment={message.attachment}
          money={money}
          t={t}
          num={num}
          digits={digits}
        />
      ) : null}

      <div className="flex items-center gap-1.5 px-1">
        {isAi ? (
          <span className="flex items-center gap-1 text-[0.5625rem] text-primary">
            <Bot className="size-2.5" />
            {t("common.ai" as never)}
          </span>
        ) : null}
        <span className="nums text-[0.5625rem] text-muted-foreground">
          {time(message.at)}
        </span>
        {message.confidence !== undefined ? (
          <Meter
            value={message.confidence}
            tone={message.confidence > 0.8 ? "success" : "warning"}
            className="w-[86px]"
          />
        ) : null}
      </div>
    </motion.div>
  )
}

function AttachmentCard({
  attachment,
  money,
  t,
  num,
  digits,
}: {
  attachment: NonNullable<Message["attachment"]>
  money: ReturnType<typeof useMoney>
  t: (key: never) => string
  num: (value: number) => string
  digits: (value: string) => string
}) {
  if (attachment.kind === "booking") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 28,
          delay: 0.15,
        }}
        className="w-[260px] overflow-hidden rounded-xl bg-card ring-1 ring-[color-mix(in_oklch,var(--success)_35%,transparent)]"
      >
        <div className="flex items-center gap-1.5 bg-[color-mix(in_oklch,var(--success)_12%,transparent)] px-3 py-1.5">
          <CalendarCheck className="size-3 text-[var(--success)]" />
          <span className="text-[0.625rem] font-medium text-[var(--success)]">
            {t("inbox.bookingCreated" as never)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-y-2 p-3">
          <Field
            label={t("common.room" as never)}
            value={digits(String(attachment.payload.room))}
          />
          <Field
            label={t("common.nights" as never)}
            value={num(Number(attachment.payload.nights))}
          />
          <Field
            label={t("common.adults" as never)}
            value={num(Number(attachment.payload.adults))}
          />
          <Field
            label={t("bookings.rate" as never)}
            value={money.format(Number(attachment.payload.rate))}
          />
        </div>
        <div className="flex items-center justify-between border-t border-[var(--hairline)] px-3 py-2">
          <span className="micro">{t("bookings.grandTotal" as never)}</span>
          <span className="nums text-sm font-medium">
            {money.format(Number(attachment.payload.total))}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-[260px] items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/[0.08]"
    >
      <BedDouble className="size-3.5 text-muted-foreground" />
      <span className="nums text-[0.6875rem]">
        {num(Number(attachment.payload.options))} {t("common.rooms" as never)}
      </span>
      <span className="nums ml-auto text-[0.6875rem] font-medium">
        {money.format(Number(attachment.payload.from))}
      </span>
    </motion.div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="micro">{label}</div>
      <div className="nums mt-0.5 text-[0.6875rem] font-medium">{value}</div>
    </div>
  )
}
