import type { Tenant } from "@/lib/types"

export const TENANTS: Tenant[] = [
  {
    id: "t_sarina_gulshan",
    slug: "sarina-gulshan",
    name: { en: "Sarina Residency", bn: "সারিনা রেসিডেন্সি" },
    city: { en: "Gulshan, Dhaka", bn: "গুলশান, ঢাকা" },
    country: { en: "Bangladesh", bn: "বাংলাদেশ" },
    kind: "business",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    roomCount: 120,
    stars: 5,
    hue: "blue",
    initials: "SR",
    established: 2011,
  },
  {
    id: "t_ocean_pearl",
    slug: "ocean-pearl-coxs-bazar",
    name: { en: "Ocean Pearl", bn: "ওশান পার্ল" },
    city: { en: "Cox's Bazar", bn: "কক্সবাজার" },
    country: { en: "Bangladesh", bn: "বাংলাদেশ" },
    kind: "resort",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    roomCount: 240,
    stars: 5,
    hue: "teal",
    initials: "OP",
    established: 2016,
  },
  {
    id: "t_sarina_bay",
    slug: "sarina-bay-singapore",
    name: { en: "Sarina Bay", bn: "সারিনা বে" },
    city: { en: "Marina Bay, Singapore", bn: "মেরিনা বে, সিঙ্গাপুর" },
    country: { en: "Singapore", bn: "সিঙ্গাপুর" },
    kind: "flagship",
    currency: "USD",
    timezone: "Asia/Singapore",
    roomCount: 380,
    stars: 5,
    hue: "purple",
    initials: "SB",
    established: 2021,
  },
]

export const DEFAULT_TENANT_ID = TENANTS[0].id

export function getTenant(id: string) {
  return TENANTS.find((tenant) => tenant.id === id) ?? TENANTS[0]
}
