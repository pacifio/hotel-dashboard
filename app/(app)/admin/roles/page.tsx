"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check, Minus, ShieldCheck } from "lucide-react"

import { Panel, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import type { Bilingual, TagHue } from "@/lib/types"

const ROLES: { id: string; name: Bilingual; hue: TagHue }[] = [
  { id: "owner", name: { en: "Owner", bn: "স্বত্বাধিকারী" }, hue: "purple" },
  {
    id: "gm",
    name: { en: "General Manager", bn: "মহাব্যবস্থাপক" },
    hue: "blue",
  },
  {
    id: "frontOffice",
    name: { en: "Front Office", bn: "ফ্রন্ট অফিস" },
    hue: "teal",
  },
  {
    id: "housekeeping",
    name: { en: "Housekeeping", bn: "হাউসকিপিং" },
    hue: "amber",
  },
  { id: "finance", name: { en: "Finance", bn: "অর্থ" }, hue: "green" },
  { id: "readonly", name: { en: "Read-only", bn: "শুধু পাঠ" }, hue: "slate" },
]

const PERMISSIONS: { id: string; name: Bilingual; grants: number[] }[] = [
  {
    id: "bookings.view",
    name: { en: "View bookings", bn: "বুকিং দেখা" },
    grants: [1, 1, 1, 1, 1, 1],
  },
  {
    id: "bookings.edit",
    name: { en: "Edit bookings", bn: "বুকিং সম্পাদনা" },
    grants: [1, 1, 1, 0, 0, 0],
  },
  {
    id: "rates.override",
    name: { en: "Override rates", bn: "ভাড়া পরিবর্তন" },
    grants: [1, 1, 0.5, 0, 0, 0],
  },
  {
    id: "folio.refund",
    name: { en: "Issue refunds", bn: "ফেরত প্রদান" },
    grants: [1, 1, 0, 0, 1, 0],
  },
  {
    id: "rooms.status",
    name: { en: "Change room status", bn: "কক্ষের অবস্থা পরিবর্তন" },
    grants: [1, 1, 1, 1, 0, 0],
  },
  {
    id: "staff.payroll",
    name: { en: "View payroll", bn: "বেতন দেখা" },
    grants: [1, 1, 0, 0, 1, 0],
  },
  {
    id: "crm.export",
    name: { en: "Export guest data", bn: "অতিথি তথ্য রপ্তানি" },
    grants: [1, 0.5, 0, 0, 0, 0],
  },
  {
    id: "ai.autopilot",
    name: { en: "Configure autopilot", bn: "অটোপাইলট কনফিগার" },
    grants: [1, 1, 0.5, 0, 0, 0],
  },
  {
    id: "admin.users",
    name: { en: "Manage users", bn: "ব্যবহারকারী ব্যবস্থাপনা" },
    grants: [1, 0.5, 0, 0, 0, 0],
  },
  {
    id: "admin.audit",
    name: { en: "Read audit log", bn: "নিরীক্ষা লগ পড়া" },
    grants: [1, 1, 0, 0, 1, 0],
  },
]

export default function RolesPage() {
  const { t, locale } = useLocale()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("admin.roles")}
        subtitle={t("nav.groups.administration")}
      />
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <Panel
          title={t("admin.permission")}
          className="min-h-0"
          bodyClassName="min-h-0 px-0"
        >
          <ScrollFade className="h-full px-4">
            <div className="min-w-[760px]">
              <div className="flex items-end border-b border-[var(--hairline)] pb-2">
                <span style={{ width: 210 }} className="micro shrink-0">
                  {t("admin.permission")}
                </span>
                {ROLES.map((role) => (
                  <span key={role.id} className="flex flex-1 justify-center">
                    <StatusTag hue={role.hue} dot>
                      {role.name[locale]}
                    </StatusTag>
                  </span>
                ))}
              </div>

              {PERMISSIONS.map((permission, rowIndex) => (
                <div
                  key={permission.id}
                  className="flex items-center border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <span style={{ width: 210 }} className="shrink-0 pr-3">
                    <span className="block truncate text-[0.6875rem]">
                      {permission.name[locale]}
                    </span>
                    <span className="block truncate font-mono text-[0.5625rem] text-muted-foreground">
                      {permission.id}
                    </span>
                  </span>
                  {permission.grants.map((grant, index) => (
                    <span key={index} className="flex flex-1 justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (rowIndex * 6 + index) * 0.006 }}
                        className={cn(
                          "flex size-5 items-center justify-center rounded-md",
                          grant === 1
                            ? "bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]"
                            : grant === 0.5
                              ? "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[var(--warning)]"
                              : "bg-muted text-muted-foreground/50"
                        )}
                      >
                        {grant === 1 ? (
                          <Check className="size-3" />
                        ) : grant === 0.5 ? (
                          <Minus className="size-3" />
                        ) : null}
                      </motion.span>
                    </span>
                  ))}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-3 pb-1">
                <ShieldCheck className="size-3 text-muted-foreground" />
                <Legend tone="success" label={t("common.enabled")} />
                <Legend tone="warning" label={t("common.optional")} />
                <Legend tone="muted" label={t("common.disabled")} />
              </div>
            </div>
          </ScrollFade>
        </Panel>
      </div>
    </div>
  )
}

function Legend({
  tone,
  label,
}: {
  tone: "success" | "warning" | "muted"
  label: string
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="size-2.5 rounded"
        style={{
          background:
            tone === "muted"
              ? "var(--muted)"
              : `color-mix(in oklch, var(--${tone}) 40%, transparent)`,
        }}
      />
      <span className="text-[0.625rem] text-muted-foreground">{label}</span>
    </span>
  )
}
