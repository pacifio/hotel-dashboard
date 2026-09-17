"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Building2, Check, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { Sparkline } from "@/components/motion/comb-chart"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { generateDataset } from "@/lib/mock/generate"
import { useTenants } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS, HUE_VAR } from "@/lib/hue"
import { formatCompactCurrency } from "@/lib/i18n/format"

export default function PropertiesPage() {
  const { tenants, tenantId, setTenantId } = useTenants()
  const { t, locale, num, pct } = useLocale()

  // The portfolio view is the one place that reads across every tenant at once.
  const portfolio = React.useMemo(
    () =>
      tenants.map((tenant, index) => {
        const dataset = generateDataset(tenant)
        return {
          tenant,
          occupancy: dataset.kpis[0].value,
          adr: dataset.kpis[1].value,
          revenue: dataset.kpis[3].value,
          delta: dataset.kpis[3].delta,
          spark: dataset.kpis[3].spark,
          color: CHART_COLORS[index],
        }
      }),
    [tenants]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("admin.properties")}
        subtitle={`${num(tenants.length)} ${t("admin.properties").toLowerCase()}`}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid gap-2.5 lg:grid-cols-3">
          {portfolio.map((entry, index) => {
            const active = entry.tenant.id === tenantId
            return (
              <motion.button
                key={entry.tenant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => setTenantId(entry.tenant.id)}
                className="text-left"
              >
                <Panel
                  title={
                    <span className="flex items-center gap-2">
                      <span
                        className="flex size-6 items-center justify-center rounded-md text-[0.625rem] font-semibold"
                        style={{
                          background: `color-mix(in oklch, ${HUE_VAR[entry.tenant.hue]} 16%, transparent)`,
                          color: HUE_VAR[entry.tenant.hue],
                        }}
                      >
                        {entry.tenant.initials}
                      </span>
                      {entry.tenant.name[locale]}
                    </span>
                  }
                  subtitle={entry.tenant.city[locale]}
                  actions={
                    active ? (
                      <StatusTag hue="green" dot>
                        <Check className="size-2" />
                        {t("common.live")}
                      </StatusTag>
                    ) : null
                  }
                  className={cn(
                    "transition-all",
                    active && "ring-2 ring-primary"
                  )}
                >
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Stat
                      label={t("dashboard.occupancy")}
                      value={pct(entry.occupancy, 1)}
                    />
                    <Stat
                      label={t("dashboard.adr")}
                      value={formatCompactCurrency(
                        entry.adr,
                        locale,
                        entry.tenant.currency
                      )}
                    />
                    <Stat
                      label={t("common.rooms")}
                      value={num(entry.tenant.roomCount)}
                    />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="figure text-lg">
                      {formatCompactCurrency(
                        entry.revenue,
                        locale,
                        entry.tenant.currency
                      )}
                    </span>
                    <StatusTag hue={entry.delta >= 0 ? "green" : "rose"}>
                      {entry.delta >= 0 ? "+" : ""}
                      {num(entry.delta, { maximumFractionDigits: 1 })}%
                    </StatusTag>
                  </div>
                  <Sparkline
                    values={entry.spark}
                    color={entry.color}
                    className="mt-2"
                  />
                  <div className="mt-3 flex items-center gap-1.5 text-[0.625rem] text-muted-foreground">
                    <Building2 className="size-3" />
                    {entry.tenant.currency} · {entry.tenant.timezone}
                  </div>
                </Panel>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-2">
      <div className="micro">{label}</div>
      <div className="nums mt-1 text-[0.6875rem] font-medium">{value}</div>
    </div>
  )
}
