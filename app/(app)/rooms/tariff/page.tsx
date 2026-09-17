"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Tag } from "lucide-react"

import { Panel, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { HUE_VAR } from "@/lib/hue"
import { addDays, demoToday, isoDay } from "@/lib/demo-time"

export default function TariffPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, num, date } = useLocale()

  const days = React.useMemo(
    () => Array.from({ length: 28 }, (_, i) => addDays(demoToday(), i)),
    []
  )

  /** Rate grid: base rate modulated by weekend and forecast demand per day. */
  const demandByDay = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const point of data.series) map.set(point.date, point.occupancy)
    return map
  }, [data.series])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("rooms.tariff")} subtitle={t("bookings.ratePlan")}>
        <StatusTag hue="blue" dot>
          BAR
        </StatusTag>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <Panel
          title={t("rooms.baseRate")}
          className="min-h-0"
          bodyClassName="min-h-0 px-0"
        >
          <ScrollFade className="h-full px-4">
            <div className="min-w-[900px]">
              <div className="flex border-b border-[var(--hairline)] pb-2">
                <span style={{ width: 132 }} className="micro shrink-0">
                  {t("bookings.roomType")}
                </span>
                {days.map((day) => {
                  const weekend = [5, 6].includes(day.getUTCDay())
                  return (
                    <span
                      key={isoDay(day)}
                      className={cn(
                        "nums flex-1 text-center text-[0.5625rem]",
                        weekend
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {num(day.getUTCDate(), { useGrouping: false })}
                    </span>
                  )
                })}
              </div>

              {data.roomTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center border-b border-[var(--hairline)] py-1.5 last:border-0"
                >
                  <span
                    style={{ width: 132 }}
                    className="flex shrink-0 items-center gap-1.5 pr-2"
                  >
                    <span
                      className="size-2 rounded-[3px]"
                      style={{ background: HUE_VAR[type.hue] }}
                    />
                    <span className="truncate text-[0.6875rem]">
                      {t(`rooms.types.${type.id}` as never)}
                    </span>
                  </span>
                  {days.map((day, index) => {
                    const iso = isoDay(day)
                    const weekend = [5, 6].includes(day.getUTCDay())
                    const demand = demandByDay.get(iso) ?? 70
                    const rate = Math.round(
                      type.baseRate *
                        (weekend ? 1.16 : 1) *
                        (1 + (demand - 70) / 340)
                    )
                    const heat = Math.min(1, Math.max(0, (demand - 55) / 45))
                    return (
                      <motion.span
                        key={iso}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.006 }}
                        title={`${date(iso)} · ${num(Math.round(demand))}%`}
                        className="nums mx-px flex-1 rounded py-1 text-center text-[0.625rem]"
                        style={{
                          background: `color-mix(in oklch, var(--primary) ${Math.round(heat * 16)}%, transparent)`,
                        }}
                      >
                        {money.compact(rate)}
                      </motion.span>
                    )
                  })}
                </div>
              ))}

              <div className="flex items-center gap-2 pt-3 pb-1">
                <Tag className="size-3 text-muted-foreground" />
                <span className="text-[0.625rem] text-muted-foreground">
                  {t("rooms.weekendRate")} +16% · {t("rooms.seasonalRate")}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="text-[0.625rem] text-muted-foreground">
                    {t("dashboard.occupancy")}
                  </span>
                  {[0.05, 0.3, 0.6, 1].map((step) => (
                    <span
                      key={step}
                      className="size-3 rounded"
                      style={{
                        background: `color-mix(in oklch, var(--primary) ${Math.round(step * 16)}%, transparent)`,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </ScrollFade>
        </Panel>
      </div>
    </div>
  )
}
