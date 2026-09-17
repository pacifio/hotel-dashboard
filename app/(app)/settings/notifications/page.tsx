"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Bell, Mail, MessageSquare, Sparkles } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { useLocale } from "@/lib/i18n/provider"
import type { Bilingual } from "@/lib/types"

const GROUPS: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: Bilingual
  rows: { id: string; label: Bilingual; on: boolean }[]
}[] = [
  {
    id: "email",
    icon: Mail,
    title: { en: "Email", bn: "ইমেইল" },
    rows: [
      {
        id: "nightAudit",
        label: { en: "Night audit complete", bn: "নাইট অডিট সম্পন্ন" },
        on: true,
      },
      {
        id: "flash",
        label: { en: "Daily manager flash", bn: "দৈনিক ম্যানেজার ফ্ল্যাশ" },
        on: true,
      },
      {
        id: "invoice",
        label: { en: "Invoice overdue", bn: "চালান মেয়াদোত্তীর্ণ" },
        on: true,
      },
      {
        id: "weekly",
        label: { en: "Weekly pace report", bn: "সাপ্তাহিক পেস রিপোর্ট" },
        on: false,
      },
    ],
  },
  {
    id: "push",
    icon: Bell,
    title: { en: "Push", bn: "পুশ" },
    rows: [
      { id: "vip", label: { en: "VIP arrival", bn: "ভিআইপি আগমন" }, on: true },
      {
        id: "oos",
        label: { en: "Room out of service", bn: "কক্ষ সেবার বাইরে" },
        on: true,
      },
      {
        id: "sla",
        label: { en: "SLA breach imminent", bn: "এসএলএ লঙ্ঘন আসন্ন" },
        on: true,
      },
      {
        id: "lowStock",
        label: {
          en: "Stock below reorder point",
          bn: "মজুদ পুনঃক্রয় সীমার নিচে",
        },
        on: false,
      },
    ],
  },
  {
    id: "ai",
    icon: Sparkles,
    title: { en: "AI", bn: "এআই" },
    rows: [
      {
        id: "digest",
        label: { en: "Daily AI digest", bn: "দৈনিক এআই সারসংক্ষেপ" },
        on: true,
      },
      {
        id: "pricing",
        label: {
          en: "Pricing recommendations",
          bn: "মূল্য নির্ধারণের পরামর্শ",
        },
        on: true,
      },
      {
        id: "escalation",
        label: { en: "Autopilot escalations", bn: "অটোপাইলট হস্তান্তর" },
        on: true,
      },
      {
        id: "anomaly",
        label: { en: "Forecast anomalies", bn: "পূর্বাভাসের ব্যতিক্রম" },
        on: false,
      },
    ],
  },
  {
    id: "sms",
    icon: MessageSquare,
    title: { en: "SMS", bn: "এসএমএস" },
    rows: [
      {
        id: "critical",
        label: { en: "Critical work orders", bn: "জরুরি কার্যাদেশ" },
        on: true,
      },
      {
        id: "security",
        label: { en: "Security incidents", bn: "নিরাপত্তা ঘটনা" },
        on: true,
      },
    ],
  },
]

export default function NotificationsPage() {
  const { t, locale } = useLocale()
  const [state, setState] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      GROUPS.flatMap((group) =>
        group.rows.map((row) => [`${group.id}.${row.id}`, row.on])
      )
    )
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("settings.notifications")}
        subtitle={t("nav.groups.administration")}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid max-w-[880px] gap-3 sm:grid-cols-2">
          {GROUPS.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Panel
                title={
                  <span className="flex items-center gap-1.5">
                    <group.icon className="size-3 text-muted-foreground" />
                    {group.title[locale]}
                  </span>
                }
              >
                <div className="flex flex-col gap-1 pt-1">
                  {group.rows.map((row) => {
                    const key = `${group.id}.${row.id}`
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2"
                      >
                        <span className="flex-1 truncate text-[0.6875rem]">
                          {row.label[locale]}
                        </span>
                        <Switch
                          checked={!!state[key]}
                          onCheckedChange={(checked) =>
                            setState((prev) => ({ ...prev, [key]: !!checked }))
                          }
                        />
                      </div>
                    )
                  })}
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
