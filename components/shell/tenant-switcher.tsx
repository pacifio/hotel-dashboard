"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Hotel } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { useTenants } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"

/** calendar.jpg — the identity block at the top of the sidebar. */
export function TenantSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { t, locale, num } = useLocale()
  const { tenants, tenantId, setTenantId } = useTenants()
  const active = tenants.find((tenant) => tenant.id === tenantId) ?? tenants[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors outline-none hover:bg-sidebar-accent",
          collapsed && "justify-center"
        )}
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[0.6875rem] font-semibold"
          style={{
            background: `color-mix(in oklch, ${HUE_VAR[active.hue]} 16%, transparent)`,
            color: HUE_VAR[active.hue],
          }}
        >
          {active.initials}
        </span>
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium">
                {active.name[locale]}
              </span>
              <span className="block truncate text-[0.625rem] text-muted-foreground">
                {active.city[locale]}
              </span>
            </span>
            <ChevronsUpDown className="size-3 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[248px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("shell.switchProperty")}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => setTenantId(tenant.id)}
            className="gap-2"
          >
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-semibold"
              style={{
                background: `color-mix(in oklch, ${HUE_VAR[tenant.hue]} 16%, transparent)`,
                color: HUE_VAR[tenant.hue],
              }}
            >
              {tenant.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs">
                {tenant.name[locale]}
              </span>
              <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                {tenant.city[locale]} · {num(tenant.roomCount)}{" "}
                {t("common.rooms").toLowerCase()}
              </span>
            </span>
            {tenant.id === active.id ? (
              <Check className="size-3 shrink-0 text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Hotel className="size-3.5" />
          {t("shell.allProperties")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
