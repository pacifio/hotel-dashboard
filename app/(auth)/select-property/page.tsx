"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"
import { useTenants } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { cn } from "@/lib/utils"

export default function SelectPropertyPage() {
  const { t, locale, num } = useLocale()
  const router = useRouter()
  const { tenants, tenantId, setTenantId } = useTenants()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[400px]"
    >
      <h1 className="text-xl font-medium tracking-tight">
        {t("auth.selectProperty")}
      </h1>
      <p className="mt-1 text-[0.6875rem] text-muted-foreground">
        {t("auth.selectPropertySubtitle", { count: num(tenants.length) })}
      </p>

      <div className="mt-5 grid gap-2">
        {tenants.map((tenant, index) => {
          const active = tenant.id === tenantId
          return (
            <motion.button
              key={tenant.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => setTenantId(tenant.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-card p-3 text-left ring-1 transition-all",
                active
                  ? "ring-2 ring-primary"
                  : "ring-foreground/[0.08] hover:bg-muted"
              )}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                style={{
                  background: `color-mix(in oklch, ${HUE_VAR[tenant.hue]} 16%, transparent)`,
                  color: HUE_VAR[tenant.hue],
                }}
              >
                {tenant.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">
                  {tenant.name[locale]}
                </span>
                <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                  {tenant.city[locale]} · {num(tenant.roomCount)}{" "}
                  {t("common.rooms").toLowerCase()} · {tenant.currency}
                </span>
              </span>
              {active ? (
                <Check className="size-3.5 shrink-0 text-primary" />
              ) : null}
            </motion.button>
          )
        })}
      </div>

      <Button
        size="lg"
        className="mt-4 w-full justify-center"
        onClick={() => router.push("/dashboard")}
      >
        {t("auth.continueToProperty")}
        <ArrowRight />
      </Button>
    </motion.div>
  )
}
