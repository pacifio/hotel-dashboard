import type { ClearanceLevel, TagHue } from "@/lib/types"
import type { TranslationKey } from "@/lib/i18n"

export const CLEARANCE_ORDER: ClearanceLevel[] = [
  "standard",
  "vip",
  "cip",
  "restricted",
]

export const CLEARANCE_HUE: Record<ClearanceLevel, TagHue> = {
  standard: "slate",
  vip: "amber",
  cip: "purple",
  restricted: "rose",
}

export const CLEARANCE_LABEL: Record<ClearanceLevel, TranslationKey> = {
  standard: "vms.clearance.standard",
  vip: "vms.clearance.vip",
  cip: "vms.clearance.cip",
  restricted: "vms.clearance.restricted",
}

/** Escalated clearance is only meaningful if it actually grants something. */
export const CLEARANCE_PERKS: Record<ClearanceLevel, TranslationKey[]> = {
  standard: [],
  vip: [
    "vms.perks.expressLane",
    "vms.perks.reservedBay",
    "vms.perks.hostGreeting",
    "vms.perks.porterService",
  ],
  cip: [
    "vms.perks.expressLane",
    "vms.perks.noScreening",
    "vms.perks.reservedBay",
    "vms.perks.privateLift",
    "vms.perks.loungeAccess",
    "vms.perks.porterService",
    "vms.perks.escortWaiver",
    "vms.perks.hostGreeting",
  ],
  restricted: [],
}

export function isEscalated(level: ClearanceLevel) {
  return level === "vip" || level === "cip"
}

/** Minutes a visitor has been on site, or the full duration if they've left. */
export function dwellMinutes(
  checkedInAt: string,
  checkedOutAt: string | undefined,
  now: number
) {
  const end = checkedOutAt ? new Date(checkedOutAt).getTime() : now
  return Math.max(
    0,
    Math.round((end - new Date(checkedInAt).getTime()) / 60000)
  )
}

/** Minutes past the expected departure, measured against the demo clock. */
export function overstayMinutes(
  expectedOutAt: string | undefined,
  checkedOutAt: string | undefined,
  now: number
) {
  if (checkedOutAt || !expectedOutAt) return 0
  return Math.max(
    0,
    Math.round((now - new Date(expectedOutAt).getTime()) / 60000)
  )
}

/** A visitor is overstaying once they pass their expected departure. */
export function isOverstaying(
  expectedOutAt: string | undefined,
  checkedOutAt: string | undefined,
  now: number
) {
  if (checkedOutAt || !expectedOutAt) return false
  return new Date(expectedOutAt).getTime() < now
}
