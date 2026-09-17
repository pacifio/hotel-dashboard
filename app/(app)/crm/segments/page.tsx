"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Layers, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MiniTooltip } from "@/components/ai/tool-call-card"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { Sparkline } from "@/components/motion/comb-chart"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { CompanySegment } from "@/lib/types"

export default function SegmentsPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, num, pct } = useLocale()

  const segments = React.useMemo(() => {
    const map = new Map<
      CompanySegment,
      { value: number; nights: number; count: number }
    >()
    for (const company of data.companies) {
      const entry = map.get(company.segment) ?? {
        value: 0,
        nights: 0,
        count: 0,
      }
      entry.value += company.accountValue
      entry.nights += company.roomNights
      entry.count += 1
      map.set(company.segment, entry)
    }
    const total = [...map.values()].reduce((sum, entry) => sum + entry.value, 0)
    return [...map.entries()]
      .sort((a, b) => b[1].value - a[1].value)
      .map(([segment, entry], index) => ({
        segment,
        ...entry,
        share: (entry.value / total) * 100,
        label: t(`crm.segments.${segment}` as never),
        color: CHART_COLORS[index % CHART_COLORS.length],
        hue: data.companies.find((c) => c.segment === segment)?.hue ?? "slate",
        spark: Array.from({ length: 18 }, (_, i) =>
          Math.abs(Math.sin(i / 2 + index))
        ),
      }))
  }, [data.companies, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("nav.segments")} subtitle={t("nav.groups.crm")}>
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-5 pb-5 lg:grid-cols-[320px_1fr]">
        <Panel title={t("finance.bySegment")}>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                >
                  {segments.map((segment) => (
                    <Cell key={segment.segment} fill={segment.color} />
                  ))}
                </Pie>
                <Tooltip content={<MiniTooltip money />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t("crm.companies")} delay={0.05}>
          <div className="flex flex-col">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.segment}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-3 border-b border-[var(--hairline)] py-2.5 last:border-0"
              >
                <StatusTag hue={segment.hue} dot>
                  {segment.label}
                </StatusTag>
                <Sparkline
                  values={segment.spark}
                  color={segment.color}
                  className="w-24 shrink-0"
                />
                <span className="nums ml-auto w-16 text-right text-[0.6875rem] text-muted-foreground">
                  {num(segment.count)}
                </span>
                <span className="nums w-20 text-right text-[0.6875rem] text-muted-foreground">
                  {num(segment.nights)}
                </span>
                <span className="nums w-20 text-right text-[0.6875rem] font-medium">
                  {money.compact(segment.value)}
                </span>
                <span className="nums w-14 text-right text-[0.6875rem] text-muted-foreground">
                  {pct(segment.share, 1)}
                </span>
              </motion.div>
            ))}
            <div className="flex items-center gap-1.5 pt-3 text-[0.625rem] text-muted-foreground">
              <Layers className="size-3" />
              {t("crm.accountValue")} · {t("crm.roomNights")}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
