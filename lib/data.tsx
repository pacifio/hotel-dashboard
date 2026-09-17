"use client"

import * as React from "react"

import { generateDataset } from "@/lib/mock/generate"
import { useUi } from "@/lib/store"
import { getTenant, TENANTS } from "@/lib/tenants"
import type { Dataset, Tenant } from "@/lib/types"
import { useLocale } from "@/lib/i18n/provider"
import { formatCompactCurrency, formatCurrency } from "@/lib/i18n/format"

/** Datasets are pure functions of the tenant slug — build each one once. */
const cache = new Map<string, Dataset>()

function datasetFor(tenant: Tenant) {
  const existing = cache.get(tenant.id)
  if (existing) return existing
  const built = generateDataset(tenant)
  cache.set(tenant.id, built)
  return built
}

const DataContext = React.createContext<Dataset | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const tenantId = useUi((state) => state.tenantId)
  const dataset = React.useMemo(
    () => datasetFor(getTenant(tenantId)),
    [tenantId]
  )
  return <DataContext.Provider value={dataset}>{children}</DataContext.Provider>
}

export function useDataset() {
  const dataset = React.useContext(DataContext)
  if (!dataset) throw new Error("useDataset must be used inside <DataProvider>")
  return dataset
}

export function useTenant() {
  return useDataset().tenant
}

export function useTenants() {
  const tenantId = useUi((state) => state.tenantId)
  const setTenantId = useUi((state) => state.setTenantId)
  return { tenants: TENANTS, tenantId, setTenantId }
}

/** Currency formatting bound to both the active locale and the active property. */
export function useMoney() {
  const { locale } = useLocale()
  const tenant = useTenant()
  return React.useMemo(
    () => ({
      currency: tenant.currency,
      symbol: tenant.currency === "USD" ? "$" : "৳",
      format: (value: number, options?: Intl.NumberFormatOptions) =>
        formatCurrency(value, locale, tenant.currency, options),
      compact: (value: number) =>
        formatCompactCurrency(value, locale, tenant.currency),
    }),
    [locale, tenant.currency]
  )
}

/* ------------------------------------------------------------------ *
 * Lookup helpers — small maps built once per dataset, used everywhere
 * ------------------------------------------------------------------ */

export function useLookups() {
  const data = useDataset()
  return React.useMemo(
    () => ({
      guest: new Map(data.guests.map((g) => [g.id, g])),
      room: new Map(data.rooms.map((r) => [r.id, r])),
      roomType: new Map(data.roomTypes.map((t) => [t.id, t])),
      staff: new Map(data.staff.map((s) => [s.id, s])),
      company: new Map(data.companies.map((c) => [c.id, c])),
      contact: new Map(data.contacts.map((c) => [c.id, c])),
      supplier: new Map(data.suppliers.map((s) => [s.id, s])),
      visitor: new Map(data.visitors.map((v) => [v.id, v])),
      vehicle: new Map(data.vehicles.map((v) => [v.id, v])),
      camera: new Map(data.cameras.map((c) => [c.id, c])),
      invoice: new Map(data.invoices.map((i) => [i.id, i])),
    }),
    [data]
  )
}
