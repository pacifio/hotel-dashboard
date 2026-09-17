"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check, Plug, RefreshCw, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { Sparkline } from "@/components/motion/comb-chart"
import { StatusTag } from "@/components/motion/status-tag"
import { Meter } from "@/components/motion/waveform"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import { SOURCE_HUE, SOURCE_LABEL } from "@/lib/labels"
import type { BookingSource } from "@/lib/types"

const OTA: BookingSource[] = [
  "booking.com",
  "agoda",
  "expedia",
  "airbnb",
  "direct",
  "corporate",
]

export default function ChannelsPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, locale, num, pct } = useLocale()
  const [syncing, setSyncing] = React.useState<string | null>(null)
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(
    Object.fromEntries(OTA.map((id) => [id, true]))
  )

  const stats = React.useMemo(() => {
    const map = new Map<BookingSource, { count: number; value: number }>()
    for (const reservation of data.reservations) {
      if (reservation.status === "cancelled") continue
      const entry = map.get(reservation.source) ?? { count: 0, value: 0 }
      entry.count += 1
      entry.value += reservation.total
      map.set(reservation.source, entry)
    }
    const total = [...map.values()].reduce((sum, entry) => sum + entry.value, 0)
    return OTA.map((id, index) => {
      const entry = map.get(id) ?? { count: 0, value: 0 }
      return {
        id,
        ...entry,
        share: total ? (entry.value / total) * 100 : 0,
        commission:
          id === "direct" || id === "corporate" ? 0 : 0.12 + index * 0.02,
        parity: 0.82 + (index % 4) * 0.05,
        color: CHART_COLORS[index % CHART_COLORS.length],
        spark: Array.from({ length: 20 }, (_, i) =>
          Math.abs(Math.sin(i / 2 + index))
        ),
      }
    })
  }, [data.reservations])

  const kpis = React.useMemo(() => {
    const connected = OTA.filter((id) => enabled[id]).length
    const commission = stats.reduce(
      (sum, stat) => sum + stat.value * stat.commission,
      0
    )
    return [
      {
        id: "connected",
        label: t("admin.connected"),
        value: connected,
        color: CHART_COLORS[0],
      },
      {
        id: "roomNights",
        label: t("crm.roomNights"),
        value: stats.reduce((sum, stat) => sum + stat.count, 0),
        color: CHART_COLORS[1],
      },
      {
        id: "commission",
        label: t("bookings.rateParity"),
        value: commission,
        prefix: money.symbol,
        format: { notation: "compact" as const, maximumFractionDigits: 1 },
        color: CHART_COLORS[3],
      },
      {
        id: "direct",
        label: t("dashboard.direct"),
        value: Math.round(stats.find((s) => s.id === "direct")?.share ?? 0),
        suffix: "%",
        color: CHART_COLORS[5],
      },
    ]
  }, [stats, enabled, t, money.symbol])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("bookings.channelManager")}
        subtitle={t("bookings.syncedAgo", { time: num(4) })}
      >
        <Button
          size="sm"
          onClick={() => {
            setSyncing("all")
            setTimeout(() => {
              setSyncing(null)
              toast.success(t("bookings.inventoryPushed"))
            }, 1400)
          }}
        >
          <RefreshCw className={syncing ? "animate-spin" : undefined} />
          {t("bookings.syncNow")}
        </Button>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        <KpiStrip cells={kpis} />
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Panel
                title={
                  <span className="flex items-center gap-1.5">
                    <Plug className="size-3 text-muted-foreground" />
                    {SOURCE_LABEL[stat.id][locale]}
                  </span>
                }
                actions={
                  <Switch
                    checked={!!enabled[stat.id]}
                    onCheckedChange={(checked) =>
                      setEnabled((prev) => ({ ...prev, [stat.id]: !!checked }))
                    }
                  />
                }
              >
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="figure text-xl">
                    {money.compact(stat.value)}
                  </span>
                  <StatusTag hue={SOURCE_HUE[stat.id]}>
                    {pct(stat.share, 1)}
                  </StatusTag>
                </div>
                <Sparkline
                  values={stat.spark}
                  color={stat.color}
                  className="mt-2"
                />
                <div className="mt-3 flex flex-col gap-2">
                  <Meter
                    value={stat.parity}
                    label={t("bookings.rateParity")}
                    tone={stat.parity > 0.9 ? "success" : "warning"}
                  />
                  <div className="flex items-center justify-between text-[0.625rem] text-muted-foreground">
                    <span>{t("crm.roomNights")}</span>
                    <span className="nums">{num(stat.count)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[0.625rem]">
                    <span className="text-muted-foreground">
                      {t("finance.methods.ota")}
                    </span>
                    <span className="nums">
                      {stat.commission ? pct(stat.commission * 100, 0) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {enabled[stat.id] ? (
                      <StatusTag hue="green" dot>
                        <Check className="size-2" />
                        {t("admin.connected")}
                      </StatusTag>
                    ) : (
                      <StatusTag hue="amber" dot>
                        <TriangleAlert className="size-2" />
                        {t("admin.notConnected")}
                      </StatusTag>
                    )}
                  </div>
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
