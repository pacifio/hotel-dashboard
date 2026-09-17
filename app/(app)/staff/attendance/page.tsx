"use client"

import * as React from "react"
import { motion } from "motion/react"

import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { cn } from "@/lib/utils"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import { addDays, demoToday, isoDay } from "@/lib/demo-time"
import type { AttendanceState } from "@/lib/types"

const STATE_COLOR: Record<AttendanceState, string> = {
  present: "var(--success)",
  late: "var(--warning)",
  absent: "var(--destructive)",
  onLeave: "var(--muted-foreground)",
}

export default function AttendancePage() {
  const data = useDataset()
  const { t, locale, num, date, pct } = useLocale()

  const days = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) =>
        isoDay(addDays(demoToday(), -13 + i))
      ),
    []
  )

  /** A staff × day heat grid — the fastest read on who is actually showing up. */
  const grid = React.useMemo(() => {
    const byStaff = new Map<string, Map<string, AttendanceState>>()
    for (const record of data.attendance) {
      const row = byStaff.get(record.staffId) ?? new Map()
      row.set(record.date, record.state)
      byStaff.set(record.staffId, row)
    }
    return data.staff.slice(0, 26).map((member) => ({
      member,
      cells: days.map((day) => byStaff.get(member.id)?.get(day)),
    }))
  }, [data.attendance, data.staff, days])

  const kpis = React.useMemo(() => {
    const today = isoDay(demoToday())
    const todays = data.attendance.filter((record) => record.date === today)
    const count = (state: AttendanceState) =>
      todays.filter((record) => record.state === state).length
    return [
      {
        id: "present",
        label: t("staff.present"),
        value: count("present"),
        color: CHART_COLORS[5],
      },
      {
        id: "late",
        label: t("staff.late"),
        value: count("late"),
        color: CHART_COLORS[3],
      },
      {
        id: "absent",
        label: t("staff.absent"),
        value: count("absent"),
        color: CHART_COLORS[4],
      },
      {
        id: "leave",
        label: t("staff.onLeave"),
        value: count("onLeave"),
        color: CHART_COLORS[7],
      },
    ]
  }, [data.attendance, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("staff.attendance")}
        subtitle={`${date(days[0])} — ${date(days[days.length - 1])}`}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <Panel
          title={t("staff.roster")}
          className="min-h-0"
          bodyClassName="px-0 min-h-0"
        >
          <ScrollFade className="h-full px-4">
            <div className="flex pb-2">
              <span style={{ width: 168 }} className="micro shrink-0">
                {t("common.name")}
              </span>
              {days.map((day) => (
                <span
                  key={day}
                  className="nums w-7 shrink-0 text-center text-[0.5625rem] text-muted-foreground"
                >
                  {num(new Date(day).getUTCDate(), { useGrouping: false })}
                </span>
              ))}
            </div>
            {grid.map(({ member, cells }, index) => (
              <div key={member.id} className="flex items-center py-0.5">
                <span
                  style={{ width: 168 }}
                  className="flex shrink-0 items-center gap-1.5 pr-2"
                >
                  <Avatar
                    name={member.name[locale]}
                    seed={member.avatarSeed}
                    size={18}
                  />
                  <span className="truncate text-[0.6875rem]">
                    {member.name[locale]}
                  </span>
                </span>
                {cells.map((state, cellIndex) => (
                  <span
                    key={cellIndex}
                    className="flex w-7 shrink-0 justify-center"
                  >
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (index * 3 + cellIndex) * 0.004 }}
                      title={state}
                      className={cn("size-4 rounded-[3px]")}
                      style={{
                        background: state
                          ? `color-mix(in oklch, ${STATE_COLOR[state]} ${state === "present" ? 70 : 55}%, transparent)`
                          : "var(--muted)",
                      }}
                    />
                  </span>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-3 pt-3 pb-1">
              {(["present", "late", "absent", "onLeave"] as const).map(
                (state) => (
                  <span key={state} className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-[3px]"
                      style={{
                        background: `color-mix(in oklch, ${STATE_COLOR[state]} 70%, transparent)`,
                      }}
                    />
                    <span className="text-[0.625rem] text-muted-foreground">
                      {t(`staff.${state}` as never)}
                    </span>
                  </span>
                )
              )}
              <span className="ml-auto text-[0.625rem] text-muted-foreground">
                {pct(
                  (data.attendance.filter((r) => r.state === "present").length /
                    data.attendance.length) *
                    100,
                  1
                )}{" "}
                {t("staff.present").toLowerCase()}
              </span>
            </div>
          </ScrollFade>
        </Panel>
      </div>
    </div>
  )
}
