"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Car, IdCard, Printer, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CLEARANCE_HUE, CLEARANCE_LABEL } from "@/lib/vms"

export default function GatePassPage() {
  const data = useDataset()
  const lookups = useLookups()
  const { t, locale, num, time } = useLocale()

  const active = React.useMemo(
    () => data.visitors.filter((visitor) => !visitor.checkedOutAt).slice(0, 12),
    [data.visitors]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("visitors.gatePass")}
        subtitle={`${num(active.length)} ${t("common.live").toLowerCase()}`}
      >
        <Button
          size="sm"
          onClick={() => toast.success(t("visitors.issuePass"))}
        >
          <UserPlus />
          {t("visitors.issuePass")}
        </Button>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {active.map((visitor, index) => {
            const host = lookups.staff.get(visitor.hostStaffId)
            const vehicle = visitor.vehicleId
              ? lookups.vehicle.get(visitor.vehicleId)
              : undefined
            return (
              <motion.div
                key={visitor.id}
                initial={{ opacity: 0, y: 10, rotateX: -6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <Panel
                  title={
                    <span className="flex items-center gap-1.5">
                      <IdCard className="size-3 text-muted-foreground" />
                      <span className="nums">{visitor.badge}</span>
                    </span>
                  }
                  actions={
                    <StatusTag hue={CLEARANCE_HUE[visitor.clearance]} dot>
                      {t(CLEARANCE_LABEL[visitor.clearance])}
                    </StatusTag>
                  }
                >
                  <div className="flex items-center gap-2.5 pt-1">
                    <Avatar name={visitor.name[locale]} size={36} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">
                        {visitor.name[locale]}
                      </div>
                      <div className="truncate text-[0.625rem] text-muted-foreground">
                        {visitor.company[locale]}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Field
                      label={t("visitors.purpose")}
                      value={t(`visitors.purposes.${visitor.purpose}` as never)}
                    />
                    <Field
                      label={t("visitors.checkedInAt")}
                      value={time(visitor.checkedInAt)}
                    />
                    <Field
                      label={t("visitors.visiting")}
                      value={host?.name[locale] ?? "—"}
                    />
                    <Field label={t("common.phone")} value={visitor.phone} />
                  </div>

                  {vehicle ? (
                    <div className="mt-2 flex items-center gap-1.5 rounded-md bg-surface px-2 py-1.5">
                      <Car className="size-3 text-muted-foreground" />
                      <span className="nums truncate text-[0.625rem]">
                        {vehicle.plate[locale]}
                      </span>
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center gap-1.5">
                    {/* A deterministic pseudo-barcode keeps the pass looking real */}
                    <span className="flex h-6 flex-1 items-end gap-[2px] overflow-hidden">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <span
                          key={i}
                          className="flex-1 rounded-[1px] bg-foreground"
                          style={{
                            height: `${((i * 37 + visitor.badge.length * 13) % 3) + 1}0%`,
                            opacity: 0.85,
                          }}
                        />
                      ))}
                    </span>
                    <Button size="xs" variant="ghost">
                      <Printer />
                    </Button>
                  </div>
                </Panel>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="micro">{label}</div>
      <div className="nums mt-0.5 truncate text-[0.6875rem]">{value}</div>
    </div>
  )
}
