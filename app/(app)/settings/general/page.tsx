"use client"

import * as React from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"

export default function GeneralSettingsPage() {
  const tenant = useTenant()
  const { t, locale } = useLocale()

  const fields = [
    {
      id: "name",
      label: t("settings.propertyName"),
      value: tenant.name[locale],
    },
    { id: "city", label: t("common.name"), value: tenant.city[locale] },
    { id: "timezone", label: t("settings.timezone"), value: tenant.timezone },
    { id: "currency", label: t("settings.currency"), value: tenant.currency },
    { id: "checkIn", label: t("settings.checkInTime"), value: "14:00" },
    { id: "checkOut", label: t("settings.checkOutTime"), value: "12:00" },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("settings.general")} subtitle={tenant.name[locale]}>
        <Button size="sm" onClick={() => toast.success(t("common.save"))}>
          <Save />
          {t("common.save")}
        </Button>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <Panel title={t("settings.general")} className="max-w-[640px]">
          <div className="grid gap-3 pt-1 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.id} className="grid gap-1">
                <span className="micro">{field.label}</span>
                <input
                  defaultValue={field.value}
                  className="h-8 rounded-md border border-border bg-surface px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
