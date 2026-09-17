"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Bot, Headset, Languages, ShieldCheck, Zap } from "lucide-react"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { Meter } from "@/components/motion/waveform"
import { StatusTag } from "@/components/motion/status-tag"
import { ChannelBadge } from "@/components/icons/channel-icons"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { Bilingual, ChannelId } from "@/lib/types"

const CHANNELS: ChannelId[] = [
  "whatsapp",
  "messenger",
  "instagram",
  "sms",
  "email",
  "voice",
  "webchat",
]

const RULES: { id: string; label: Bilingual; hint: Bilingual }[] = [
  {
    id: "groupSize",
    label: { en: "Escalate group bookings", bn: "গ্রুপ বুকিং হস্তান্তর করুন" },
    hint: {
      en: "Anything above the room ceiling goes to the sales desk.",
      bn: "কক্ষসীমার বেশি হলে বিক্রয় ডেস্কে পাঠানো হয়।",
    },
  },
  {
    id: "repeatComplaint",
    label: {
      en: "Escalate repeat complaints",
      bn: "পুনরাবৃত্ত অভিযোগ হস্তান্তর করুন",
    },
    hint: {
      en: "Second complaint on the same room within 30 days needs a human.",
      bn: "৩০ দিনের মধ্যে একই কক্ষে দ্বিতীয় অভিযোগে মানুষ প্রয়োজন।",
    },
  },
  {
    id: "refund",
    label: { en: "Never issue refunds", bn: "কখনও ফেরত দেবে না" },
    hint: {
      en: "The agent can quote a policy but cannot move money.",
      bn: "এজেন্ট নীতি জানাতে পারে, কিন্তু অর্থ ফেরত দিতে পারে না।",
    },
  },
  {
    id: "vip",
    label: {
      en: "Hand off platinum guests",
      bn: "প্ল্যাটিনাম অতিথি হস্তান্তর করুন",
    },
    hint: {
      en: "Top-tier loyalty members always reach a named host.",
      bn: "শীর্ষ স্তরের লয়্যালটি সদস্যরা সবসময় নির্দিষ্ট হোস্টের কাছে যান।",
    },
  },
]

export default function AutopilotPage() {
  const data = useDataset()
  const { t, locale, num, pct } = useLocale()

  const [channels, setChannels] = React.useState<Record<string, boolean>>(
    Object.fromEntries(CHANNELS.map((id) => [id, id !== "email"]))
  )
  const [rules, setRules] = React.useState<Record<string, boolean>>(
    Object.fromEntries(RULES.map((rule) => [rule.id, true]))
  )
  const [threshold, setThreshold] = React.useState(72)
  const [roomCeiling, setRoomCeiling] = React.useState(15)

  const kpis = React.useMemo(() => {
    const handled = data.conversations.filter(
      (c) => c.state === "aiHandled"
    ).length
    const escalated = data.conversations.filter(
      (c) => c.state === "needsHuman"
    ).length
    return [
      {
        id: "handled",
        label: t("inbox.aiHandled"),
        value: Math.round((handled / data.conversations.length) * 100),
        suffix: "%",
        delta: 12.6,
        color: CHART_COLORS[0],
      },
      {
        id: "escalated",
        label: t("inbox.needsHuman"),
        value: escalated,
        color: CHART_COLORS[3],
      },
      {
        id: "channels",
        label: t("inbox.allChannels"),
        value: Object.values(channels).filter(Boolean).length,
        color: CHART_COLORS[1],
      },
      {
        id: "confidence",
        label: t("inbox.confidence"),
        value: threshold,
        suffix: "%",
        color: CHART_COLORS[5],
      },
    ]
  }, [data.conversations, channels, threshold, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inbox.autopilot")}
        subtitle={t("nav.groups.omnichannel")}
      >
        <StatusTag hue="green" dot>
          {t("common.live")}
        </StatusTag>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel
            title={
              <span className="flex items-center gap-1.5">
                <Zap className="size-3 text-primary" />
                {t("inbox.allChannels")}
              </span>
            }
          >
            <div className="flex flex-col gap-1 pt-1">
              {CHANNELS.map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-2.5 rounded-lg bg-surface px-2.5 py-2"
                >
                  <ChannelBadge channel={id} size={24} />
                  <span className="flex-1 text-[0.6875rem]">
                    {t(`inbox.channels.${id}` as never)}
                  </span>
                  <span className="nums text-[0.625rem] text-muted-foreground">
                    {num(
                      data.conversations.filter((c) => c.channel === id).length
                    )}
                  </span>
                  <Switch
                    checked={!!channels[id]}
                    onCheckedChange={(checked) =>
                      setChannels((prev) => ({ ...prev, [id]: !!checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex flex-col gap-3">
            <Panel
              title={
                <span className="flex items-center gap-1.5">
                  <Bot className="size-3 text-primary" />
                  {t("inbox.confidence")}
                </span>
              }
              delay={0.05}
            >
              <div className="pt-2">
                <div className="flex items-baseline justify-between pb-2">
                  <span className="text-[0.6875rem] text-muted-foreground">
                    {t("inbox.handOff")}
                  </span>
                  <span className="nums text-[0.6875rem] font-medium">
                    {pct(threshold, 0)}
                  </span>
                </div>
                <Slider
                  value={[threshold]}
                  min={40}
                  max={99}
                  onValueChange={(value) =>
                    setThreshold(Array.isArray(value) ? value[0] : value)
                  }
                />
                <p className="mt-2 text-[0.625rem] leading-relaxed text-muted-foreground">
                  {locale === "bn"
                    ? "এই মাত্রার নিচে আস্থা থাকলে এজেন্ট নিজে উত্তর না দিয়ে মানুষের কাছে পাঠাবে।"
                    : "Below this confidence the agent stops answering and hands the thread to a human."}
                </p>

                <div className="mt-4 flex items-baseline justify-between pb-2">
                  <span className="text-[0.6875rem] text-muted-foreground">
                    {t("common.rooms")}
                  </span>
                  <span className="nums text-[0.6875rem] font-medium">
                    {num(roomCeiling)}
                  </span>
                </div>
                <Slider
                  value={[roomCeiling]}
                  min={1}
                  max={60}
                  onValueChange={(value) =>
                    setRoomCeiling(Array.isArray(value) ? value[0] : value)
                  }
                />
              </div>
            </Panel>

            <Panel
              title={
                <span className="flex items-center gap-1.5">
                  <Languages className="size-3 text-muted-foreground" />
                  {t("calls.callLanguage")}
                </span>
              }
              delay={0.1}
            >
              <div className="flex flex-col gap-2 pt-1">
                <Meter value={0.62} label="বাংলা" tone="primary" />
                <Meter value={0.38} label="English" tone="success" />
              </div>
            </Panel>
          </div>
        </div>

        <Panel
          title={
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-muted-foreground" />
              {t("inbox.handOff")}
            </span>
          }
          delay={0.15}
        >
          <div className="grid gap-2 pt-1 sm:grid-cols-2">
            {RULES.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-start gap-2.5 rounded-lg bg-surface p-3"
              >
                <Headset className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="text-[0.6875rem] font-medium">
                    {rule.label[locale]}
                  </div>
                  <p className="mt-0.5 text-[0.625rem] leading-relaxed text-muted-foreground">
                    {rule.hint[locale]}
                  </p>
                </div>
                <Switch
                  checked={!!rules[rule.id]}
                  onCheckedChange={(checked) =>
                    setRules((prev) => ({ ...prev, [rule.id]: !!checked }))
                  }
                />
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
