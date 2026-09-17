"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check, Plug, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useLocale } from "@/lib/i18n/provider"
import type { Bilingual, TagHue } from "@/lib/types"

const INTEGRATIONS: {
  id: string
  name: string
  category: Bilingual
  hue: TagHue
  connected: boolean
  detail: Bilingual
}[] = [
  {
    id: "bkash",
    name: "bKash",
    category: { en: "Payments", bn: "পেমেন্ট" },
    hue: "magenta",
    connected: true,
    detail: { en: "Mobile wallet collection", bn: "মোবাইল ওয়ালেট সংগ্রহ" },
  },
  {
    id: "nagad",
    name: "Nagad",
    category: { en: "Payments", bn: "পেমেন্ট" },
    hue: "amber",
    connected: true,
    detail: { en: "Mobile wallet collection", bn: "মোবাইল ওয়ালেট সংগ্রহ" },
  },
  {
    id: "stripe",
    name: "Stripe",
    category: { en: "Payments", bn: "পেমেন্ট" },
    hue: "purple",
    connected: true,
    detail: { en: "Card processing", bn: "কার্ড প্রক্রিয়াকরণ" },
  },
  {
    id: "twilio",
    name: "Twilio",
    category: { en: "Messaging", bn: "বার্তা" },
    hue: "rose",
    connected: true,
    detail: { en: "SMS and voice trunk", bn: "এসএমএস ও ভয়েস" },
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: { en: "Messaging", bn: "বার্তা" },
    hue: "green",
    connected: true,
    detail: { en: "Cloud API", bn: "ক্লাউড এপিআই" },
  },
  {
    id: "meta",
    name: "Meta Business",
    category: { en: "Messaging", bn: "বার্তা" },
    hue: "blue",
    connected: true,
    detail: { en: "Messenger and Instagram", bn: "মেসেঞ্জার ও ইনস্টাগ্রাম" },
  },
  {
    id: "booking",
    name: "Booking.com",
    category: { en: "Distribution", bn: "বিতরণ" },
    hue: "blue",
    connected: true,
    detail: { en: "Two-way inventory sync", bn: "দ্বিমুখী ইনভেন্টরি সিঙ্ক" },
  },
  {
    id: "agoda",
    name: "Agoda",
    category: { en: "Distribution", bn: "বিতরণ" },
    hue: "magenta",
    connected: true,
    detail: { en: "Two-way inventory sync", bn: "দ্বিমুখী ইনভেন্টরি সিঙ্ক" },
  },
  {
    id: "sabre",
    name: "Sabre GDS",
    category: { en: "Distribution", bn: "বিতরণ" },
    hue: "slate",
    connected: false,
    detail: { en: "Corporate travel distribution", bn: "কর্পোরেট ভ্রমণ বিতরণ" },
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: { en: "Accounting", bn: "হিসাবরক্ষণ" },
    hue: "teal",
    connected: false,
    detail: { en: "Ledger export", bn: "খতিয়ান রপ্তানি" },
  },
  {
    id: "onelogin",
    name: "OneLogin SSO",
    category: { en: "Security", bn: "নিরাপত্তা" },
    hue: "purple",
    connected: true,
    detail: { en: "SAML single sign-on", bn: "সামল সিঙ্গেল সাইন-অন" },
  },
  {
    id: "hikvision",
    name: "Hikvision",
    category: { en: "Security", bn: "নিরাপত্তা" },
    hue: "amber",
    connected: false,
    detail: { en: "Door locks and CCTV", bn: "দরজার তালা ও সিসিটিভি" },
  },
]

export default function IntegrationsPage() {
  const { t, locale, num } = useLocale()
  const [state, setState] = React.useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected]))
  )

  const connected = Object.values(state).filter(Boolean).length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("admin.integrations")}
        subtitle={`${num(connected)} ${t("admin.connected").toLowerCase()}`}
      >
        <Button size="sm">
          <Plus />
          {t("common.add")}
        </Button>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {INTEGRATIONS.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 12) * 0.035 }}
            >
              <Panel
                title={
                  <span className="flex items-center gap-2">
                    <span
                      className="flex size-6 items-center justify-center rounded-md text-[0.625rem] font-semibold"
                      style={{
                        background: `color-mix(in oklch, var(--hue-${integration.hue}) 16%, transparent)`,
                        color: `var(--hue-${integration.hue})`,
                      }}
                    >
                      {integration.name.slice(0, 2).toUpperCase()}
                    </span>
                    {integration.name}
                  </span>
                }
                subtitle={integration.detail[locale]}
                actions={
                  <Switch
                    checked={!!state[integration.id]}
                    onCheckedChange={(checked) =>
                      setState((prev) => ({
                        ...prev,
                        [integration.id]: !!checked,
                      }))
                    }
                  />
                }
              >
                <div className="flex items-center gap-1.5 pt-1">
                  <StatusTag hue={integration.hue}>
                    {integration.category[locale]}
                  </StatusTag>
                  {state[integration.id] ? (
                    <StatusTag hue="green" dot>
                      <Check className="size-2" />
                      {t("admin.connected")}
                    </StatusTag>
                  ) : (
                    <StatusTag hue="slate">
                      <Plug className="size-2" />
                      {t("admin.notConnected")}
                    </StatusTag>
                  )}
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
