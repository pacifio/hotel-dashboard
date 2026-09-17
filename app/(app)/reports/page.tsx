"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Clock, Download, FileText, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { Sparkline } from "@/components/motion/comb-chart"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { Bilingual, TagHue } from "@/lib/types"

type Category =
  "all" | "operations" | "revenue" | "guest" | "staff" | "compliance"

const REPORTS: {
  id: string
  name: Bilingual
  category: Exclude<Category, "all">
  hue: TagHue
  schedule: Bilingual
  ai?: boolean
}[] = [
  {
    id: "nightAudit",
    name: { en: "Night audit", bn: "নাইট অডিট" },
    category: "operations",
    hue: "blue",
    schedule: { en: "Daily 03:00", bn: "প্রতিদিন ৩:০০" },
  },
  {
    id: "managerFlash",
    name: { en: "Manager flash", bn: "ম্যানেজার ফ্ল্যাশ" },
    category: "revenue",
    hue: "green",
    schedule: { en: "Daily 07:00", bn: "প্রতিদিন ৭:০০" },
    ai: true,
  },
  {
    id: "pace",
    name: { en: "Pace report", bn: "পেস রিপোর্ট" },
    category: "revenue",
    hue: "teal",
    schedule: { en: "Weekly", bn: "সাপ্তাহিক" },
    ai: true,
  },
  {
    id: "housekeeping",
    name: { en: "Housekeeping productivity", bn: "হাউসকিপিং উৎপাদনশীলতা" },
    category: "staff",
    hue: "purple",
    schedule: { en: "Weekly", bn: "সাপ্তাহিক" },
  },
  {
    id: "satisfaction",
    name: { en: "Guest satisfaction", bn: "অতিথি সন্তুষ্টি" },
    category: "guest",
    hue: "magenta",
    schedule: { en: "Monthly", bn: "মাসিক" },
    ai: true,
  },
  {
    id: "segment",
    name: { en: "Segment performance", bn: "সেগমেন্ট কর্মক্ষমতা" },
    category: "revenue",
    hue: "amber",
    schedule: { en: "Monthly", bn: "মাসিক" },
  },
  {
    id: "vat",
    name: { en: "VAT return", bn: "ভ্যাট রিটার্ন" },
    category: "compliance",
    hue: "slate",
    schedule: { en: "Monthly", bn: "মাসিক" },
  },
  {
    id: "police",
    name: { en: "Foreign guest register", bn: "বিদেশি অতিথি নিবন্ধন" },
    category: "compliance",
    hue: "rose",
    schedule: { en: "Daily", bn: "প্রতিদিন" },
  },
  {
    id: "arrivals",
    name: { en: "Arrivals & departures", bn: "আগমন ও প্রস্থান" },
    category: "operations",
    hue: "blue",
    schedule: { en: "Daily 06:00", bn: "প্রতিদিন ৬:০০" },
  },
  {
    id: "fnbCost",
    name: { en: "F&B cost of sales", bn: "খাদ্য ও পানীয়ের ব্যয়" },
    category: "revenue",
    hue: "amber",
    schedule: { en: "Weekly", bn: "সাপ্তাহিক" },
  },
  {
    id: "attendance",
    name: { en: "Attendance summary", bn: "উপস্থিতির সারসংক্ষেপ" },
    category: "staff",
    hue: "green",
    schedule: { en: "Weekly", bn: "সাপ্তাহিক" },
  },
  {
    id: "loyalty",
    name: { en: "Loyalty tier movement", bn: "লয়্যালটি স্তর পরিবর্তন" },
    category: "guest",
    hue: "teal",
    schedule: { en: "Monthly", bn: "মাসিক" },
    ai: true,
  },
]

export default function ReportsPage() {
  const { t, locale } = useLocale()
  const [category, setCategory] = React.useState<Category>("all")

  const filtered =
    category === "all"
      ? REPORTS
      : REPORTS.filter((report) => report.category === category)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("reports.library")}
        subtitle={t("nav.groups.intelligence")}
      >
        <SegmentedPills
          size="sm"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: t("common.all") },
            { value: "operations", label: t("reports.categories.operations") },
            { value: "revenue", label: t("reports.categories.revenue") },
            { value: "guest", label: t("reports.categories.guest") },
            { value: "staff", label: t("reports.categories.staff") },
            { value: "compliance", label: t("reports.categories.compliance") },
          ]}
        />
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/ai/reports" />}
        >
          <Sparkles />
          {t("ai.reportStudio")}
        </Button>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 10) * 0.04 }}
            >
              <Panel
                title={
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-3 text-muted-foreground" />
                    {report.name[locale]}
                  </span>
                }
                onExpand={() => {}}
              >
                <div className="flex items-center gap-1.5 pt-1">
                  <StatusTag hue={report.hue}>
                    {t(`reports.categories.${report.category}` as never)}
                  </StatusTag>
                  {report.ai ? (
                    <StatusTag hue="blue">
                      <Sparkles className="size-2" />
                      {t("common.ai")}
                    </StatusTag>
                  ) : null}
                </div>
                <Sparkline
                  values={Array.from({ length: 22 }, (_, i) =>
                    Math.abs(Math.sin(i / 2 + index))
                  )}
                  color={CHART_COLORS[index % CHART_COLORS.length]}
                  className="mt-3"
                />
                <div className="mt-3 flex items-center gap-2 text-[0.625rem] text-muted-foreground">
                  <Clock className="size-2.5" />
                  {report.schedule[locale]}
                  <Button size="xs" variant="ghost" className="ml-auto">
                    <Download />
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
