"use client"

import * as React from "react"
import { motion } from "motion/react"
import { CalendarClock } from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag, HueDot } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { addDays, demoToday, isoDay } from "@/lib/demo-time"
import type { ShiftId, StaffDepartment, TagHue } from "@/lib/types"

const SHIFT_HUE: Record<ShiftId, TagHue> = {
  morning: "amber",
  evening: "purple",
  night: "blue",
}

const DEPARTMENTS: (StaffDepartment | "all")[] = [
  "all",
  "frontOffice",
  "housekeeping",
  "fnb",
  "engineering",
  "security",
]

export default function RosterPage() {
  const data = useDataset()
  const { t, locale, num, date } = useLocale()
  const [department, setDepartment] = React.useState<StaffDepartment | "all">(
    "all"
  )

  const days = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(demoToday(), i)),
    []
  )

  const staff = React.useMemo(
    () =>
      (department === "all"
        ? data.staff
        : data.staff.filter((member) => member.department === department)
      ).slice(0, 28),
    [data.staff, department]
  )

  /** A staff member works their assigned shift, with one rotating day off. */
  const shiftFor = (staffIndex: number, dayIndex: number, shift: ShiftId) =>
    (staffIndex + dayIndex) % 7 === 3 ? null : shift

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("staff.roster")}
        subtitle={`${date(days[0])} — ${date(days[6])}`}
      >
        <SegmentedPills
          size="sm"
          value={department}
          onChange={setDepartment}
          options={DEPARTMENTS.map((value) => ({
            value,
            label:
              value === "all"
                ? t("common.all")
                : t(`staff.departments.${value}` as never),
          }))}
        />
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <Panel
          title={t("staff.shift")}
          className="min-h-0"
          bodyClassName="min-h-0 px-0"
        >
          <ScrollFade className="h-full px-4">
            <div className="flex border-b border-[var(--hairline)] pb-2">
              <span style={{ width: 190 }} className="micro shrink-0">
                {t("common.name")}
              </span>
              {days.map((day) => (
                <span key={isoDay(day)} className="flex-1 text-center">
                  <span className="micro block">
                    {date(day, { weekday: "short" })}
                  </span>
                  <span className="nums text-[0.625rem] text-muted-foreground">
                    {num(day.getUTCDate(), { useGrouping: false })}
                  </span>
                </span>
              ))}
            </div>

            {staff.map((member, staffIndex) => (
              <div
                key={member.id}
                className="flex items-center border-b border-[var(--hairline)] py-1.5 last:border-0"
              >
                <span
                  style={{ width: 190 }}
                  className="flex shrink-0 items-center gap-2 pr-2"
                >
                  <Avatar
                    name={member.name[locale]}
                    seed={member.avatarSeed}
                    size={22}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.6875rem]">
                      {member.name[locale]}
                    </span>
                    <span className="block truncate text-[0.5625rem] text-muted-foreground">
                      {member.role[locale]}
                    </span>
                  </span>
                </span>
                {days.map((day, dayIndex) => {
                  const shift = shiftFor(staffIndex, dayIndex, member.shift)
                  return (
                    <span
                      key={isoDay(day)}
                      className="flex flex-1 justify-center px-0.5"
                    >
                      {shift ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: (staffIndex * 2 + dayIndex) * 0.006,
                          }}
                          className="w-full"
                        >
                          <StatusTag
                            hue={SHIFT_HUE[shift]}
                            className="w-full justify-center"
                          >
                            {t(`staff.shifts.${shift}` as never)}
                          </StatusTag>
                        </motion.span>
                      ) : (
                        <span className="text-[0.625rem] text-muted-foreground/60">
                          {t("staff.onLeave")}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            ))}

            <div className="flex items-center gap-3 pt-3 pb-1">
              <CalendarClock className="size-3 text-muted-foreground" />
              {(["morning", "evening", "night"] as const).map((shift) => (
                <span key={shift} className="flex items-center gap-1.5">
                  <HueDot hue={SHIFT_HUE[shift]} />
                  <span className="text-[0.625rem] text-muted-foreground">
                    {t(`staff.shifts.${shift}` as never)}
                  </span>
                </span>
              ))}
            </div>
          </ScrollFade>
        </Panel>
      </div>
    </div>
  )
}
