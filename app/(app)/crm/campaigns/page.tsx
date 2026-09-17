"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Plus, Send, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { Meter } from "@/components/motion/waveform"
import { StatusTag } from "@/components/motion/status-tag"
import { ChannelBadge } from "@/components/icons/channel-icons"
import { useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { Bilingual, ChannelId, TagHue } from "@/lib/types"

const CAMPAIGNS: {
  id: string
  name: Bilingual
  channel: ChannelId
  state: "live" | "scheduled" | "done"
  hue: TagHue
  sent: number
  opened: number
  booked: number
}[] = [
  {
    id: "monsoon",
    name: { en: "Monsoon staycation offer", bn: "বর্ষার স্টে-কেশন অফার" },
    channel: "whatsapp",
    state: "live",
    hue: "green",
    sent: 12400,
    opened: 0.74,
    booked: 0.09,
  },
  {
    id: "corporate",
    name: { en: "Corporate rate renewal", bn: "কর্পোরেট ভাড়া নবায়ন" },
    channel: "email",
    state: "live",
    hue: "blue",
    sent: 840,
    opened: 0.52,
    booked: 0.21,
  },
  {
    id: "winback",
    name: { en: "Win back lapsed guests", bn: "হারানো অতিথি ফিরিয়ে আনা" },
    channel: "sms",
    state: "scheduled",
    hue: "amber",
    sent: 5600,
    opened: 0.61,
    booked: 0.04,
  },
  {
    id: "eid",
    name: { en: "Eid family package", bn: "ঈদ পারিবারিক প্যাকেজ" },
    channel: "messenger",
    state: "done",
    hue: "purple",
    sent: 21800,
    opened: 0.68,
    booked: 0.12,
  },
  {
    id: "loyalty",
    name: { en: "Platinum upgrade nudge", bn: "প্ল্যাটিনাম আপগ্রেড অনুরোধ" },
    channel: "instagram",
    state: "live",
    hue: "magenta",
    sent: 3100,
    opened: 0.81,
    booked: 0.16,
  },
  {
    id: "spa",
    name: { en: "Spa weekday promotion", bn: "কর্মদিবসে স্পা প্রচারণা" },
    channel: "webchat",
    state: "done",
    hue: "teal",
    sent: 1900,
    opened: 0.44,
    booked: 0.06,
  },
]

export default function CampaignsPage() {
  const money = useMoney()
  const { t, locale, num, pct } = useLocale()

  const kpis = React.useMemo(() => {
    const sent = CAMPAIGNS.reduce((sum, c) => sum + c.sent, 0)
    const booked = CAMPAIGNS.reduce((sum, c) => sum + c.sent * c.booked, 0)
    return [
      {
        id: "live",
        label: t("common.live"),
        value: CAMPAIGNS.filter((c) => c.state === "live").length,
        color: CHART_COLORS[5],
      },
      {
        id: "sent",
        label: t("common.total"),
        value: sent,
        format: { notation: "compact" as const },
        color: CHART_COLORS[0],
      },
      {
        id: "booked",
        label: t("nav.bookings"),
        value: Math.round(booked),
        color: CHART_COLORS[1],
      },
      {
        id: "revenue",
        label: t("finance.revenue"),
        value: Math.round(booked * 22000),
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[3],
      },
    ]
  }, [t, money.symbol])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("crm.campaigns")} subtitle={t("nav.groups.crm")}>
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        <KpiStrip cells={kpis} />
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {CAMPAIGNS.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Panel
                title={
                  <span className="flex items-center gap-1.5">
                    <ChannelBadge channel={campaign.channel} size={20} />
                    {campaign.name[locale]}
                  </span>
                }
                actions={
                  <StatusTag
                    hue={
                      campaign.state === "live"
                        ? "green"
                        : campaign.state === "scheduled"
                          ? "amber"
                          : "slate"
                    }
                    dot
                  >
                    {campaign.state === "live"
                      ? t("common.live")
                      : campaign.state === "scheduled"
                        ? t("reports.scheduled")
                        : t("common.done")}
                  </StatusTag>
                }
              >
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="figure text-xl">{num(campaign.sent)}</span>
                  <span className="text-[0.625rem] text-muted-foreground">
                    {t("common.total").toLowerCase()}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Meter
                    value={campaign.opened}
                    label={t("nav.inbox")}
                    tone="primary"
                  />
                  <Meter
                    value={campaign.booked}
                    label={t("nav.bookings")}
                    tone="success"
                  />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <Sparkles className="size-3 text-primary" />
                  <span className="text-[0.625rem] text-muted-foreground">
                    {locale === "bn"
                      ? `এআই প্রস্তাব: ${pct(campaign.booked * 100 + 3, 0)} পর্যন্ত বাড়ানো সম্ভব`
                      : `AI suggests headroom to ${pct(campaign.booked * 100 + 3, 0)}`}
                  </span>
                  <Button size="xs" variant="ghost" className="ml-auto">
                    <Send />
                  </Button>
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
