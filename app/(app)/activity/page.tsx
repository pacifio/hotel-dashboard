"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Bot, CalendarCheck, CreditCard, Wrench } from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { TagHue } from "@/lib/types"

type Kind = "all" | "bookings" | "ai" | "payments" | "operations"

type Entry = {
  id: string
  kind: Exclude<Kind, "all">
  hue: TagHue
  icon: React.ReactNode
  actor: string
  title: string
  detail: string
  at: string
}

export default function ActivityPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, relative, num } = useLocale()
  const [kind, setKind] = React.useState<Kind>("all")

  /** One merged stream across reservations, agent runs, payments and work orders. */
  const entries = React.useMemo<Entry[]>(() => {
    const items: Entry[] = []

    for (const reservation of data.reservations.slice(-24)) {
      const guest = lookups.guest.get(reservation.guestId)
      items.push({
        id: `res-${reservation.id}`,
        kind: "bookings",
        hue: "blue",
        icon: <CalendarCheck className="size-3" />,
        actor: guest?.name[locale] ?? "—",
        title: t("bookings.newBooking"),
        detail: `${reservation.code} · ${money.format(reservation.total)}`,
        at: reservation.createdAt,
      })
    }

    for (const run of data.agentRuns) {
      items.push({
        id: `run-${run.id}`,
        kind: "ai",
        hue: "teal",
        icon: <Bot className="size-3" />,
        actor: run.agent[locale],
        title: run.trigger[locale],
        detail: `${num(run.steps)} · ${num(run.tokens)}`,
        at: run.startedAt,
      })
    }

    for (const payment of data.payments.slice(0, 20)) {
      items.push({
        id: `pay-${payment.id}`,
        kind: "payments",
        hue: "green",
        icon: <CreditCard className="size-3" />,
        actor: payment.reference,
        title: t(`finance.methods.${payment.method}` as never),
        detail: money.format(payment.amount),
        at: payment.at,
      })
    }

    for (const order of data.workOrders) {
      const staff = lookups.staff.get(order.reportedBy)
      items.push({
        id: `wo-${order.id}`,
        kind: "operations",
        hue: "amber",
        icon: <Wrench className="size-3" />,
        actor: staff?.name[locale] ?? "—",
        title: order.issue[locale],
        detail: order.number,
        at: order.reportedAt,
      })
    }

    return items.sort((a, b) => b.at.localeCompare(a.at))
  }, [data, lookups, locale, money, t, num])

  const filtered =
    kind === "all" ? entries : entries.filter((e) => e.kind === kind)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("nav.activity")} subtitle={t("dashboard.liveFeed")}>
        <SegmentedPills
          size="sm"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: t("common.all") },
            { value: "bookings", label: t("nav.bookings") },
            { value: "ai", label: t("common.ai") },
            { value: "payments", label: t("finance.payments") },
            { value: "operations", label: t("nav.groups.operations") },
          ]}
        />
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <Panel
          title={t("dashboard.liveFeed")}
          className="min-h-0"
          bodyClassName="min-h-0 px-0"
        >
          <ScrollFade className="h-full px-4">
            <div className="relative flex flex-col gap-3 pl-5">
              <span className="absolute inset-y-2 left-[7px] w-px bg-[var(--hairline)]" />
              {filtered.slice(0, 80).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index, 20) * 0.02 }}
                  className="relative flex items-center gap-2.5"
                >
                  <span
                    className="absolute top-1/2 -left-5 flex size-[15px] -translate-y-1/2 items-center justify-center rounded-full ring-2 ring-card"
                    style={{
                      background: `color-mix(in oklch, var(--hue-${entry.hue}) 16%, var(--card))`,
                      color: `var(--hue-${entry.hue})`,
                    }}
                  >
                    {entry.icon}
                  </span>
                  <Avatar name={entry.actor} size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.6875rem] font-medium">
                      {entry.actor}
                    </div>
                    <div className="truncate text-[0.625rem] text-muted-foreground">
                      {entry.title}
                    </div>
                  </div>
                  <StatusTag hue={entry.hue}>{entry.detail}</StatusTag>
                  <span className="shrink-0 text-[0.625rem] whitespace-nowrap text-muted-foreground">
                    {relative(entry.at)}
                  </span>
                </motion.div>
              ))}
            </div>
          </ScrollFade>
        </Panel>
      </div>
    </div>
  )
}
