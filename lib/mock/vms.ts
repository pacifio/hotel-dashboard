import { addMinutes, demoToday } from "@/lib/demo-time"
import type {
  Camera,
  ClearanceLevel,
  GateId,
  GateMovement,
  LuggageItem,
  LuggageKind,
  StaffMember,
  Vehicle,
  VehicleType,
  Visitor,
} from "@/lib/types"
import type { Rng } from "./rng"
import { bdName } from "./pools"
import {
  CAMERA_NAMES,
  CAMERA_ZONES,
  LUGGAGE_LOCATIONS,
  MOVEMENT_FLAGS,
  VEHICLE_COLOURS,
  VEHICLE_MAKES,
} from "./pools"

export const GATES: GateId[] = [
  "mainLobby",
  "porte",
  "service",
  "basement",
  "banquet",
  "staff",
]

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯"

function beng(value: number | string) {
  return String(value).replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)])
}

/** Bangladeshi plates are written in Bangla on the vehicle itself. */
export function buildPlate(rng: Rng) {
  const index = rng.int(0, 5)
  const seriesEn = ["GA", "KHA", "GHA", "CHA", "JA", "HA"][index]
  const seriesBn = ["গ", "খ", "ঘ", "চ", "জ", "হ"][index]
  const left = rng.int(10, 39)
  const right = rng.int(1000, 9999)
  return {
    en: `DHAKA METRO ${seriesEn} ${left}-${right}`,
    bn: `ঢাকা মেট্রো ${seriesBn} ${beng(left)}-${beng(right)}`,
  }
}

/**
 * Clearance is skewed hard toward standard: a property that hands out CIP
 * passes freely has no access control worth demonstrating.
 */
export function rollClearance(rng: Rng): ClearanceLevel {
  return rng.weighted<ClearanceLevel>([
    ["standard", 76],
    ["vip", 13],
    ["cip", 7],
    ["restricted", 4],
  ])
}

export function buildVehicles(
  rng: Rng,
  visitors: Visitor[],
  count: number
): Vehicle[] {
  const today = demoToday()
  return Array.from({ length: count }, (_, i) => {
    const visitor = rng.bool(0.82) ? rng.pick(visitors) : undefined
    const entry = visitor
      ? new Date(visitor.checkedInAt)
      : addMinutes(today, rng.int(-60 * 30, 60 * 8))
    const type = rng.weighted<VehicleType>([
      ["car", 46],
      ["suv", 22],
      ["van", 14],
      ["motorcycle", 10],
      ["bus", 4],
      ["truck", 4],
    ])
    const clearance = visitor?.clearance ?? rollClearance(rng)
    const out = visitor ? !!visitor.checkedOutAt : rng.bool(0.55)

    return {
      id: `veh_${i + 1}`,
      plate: buildPlate(rng),
      type,
      make: rng.pick(VEHICLE_MAKES),
      colour: rng.pick(VEHICLE_COLOURS),
      driver: visitor?.name ?? bdName(rng.int(0, 999), rng.int(0, 999)),
      visitorId: visitor?.id,
      // VIP and CIP arrivals get the reserved bays nearest the lobby.
      bay:
        clearance === "cip" || clearance === "vip"
          ? `P${rng.int(1, 6)}`
          : rng.bool(0.7)
            ? `B${rng.int(1, 2)}-${String(rng.int(1, 84)).padStart(2, "0")}`
            : undefined,
      entryAt: entry.toISOString(),
      exitAt: out
        ? addMinutes(entry, rng.int(35, 420)).toISOString()
        : undefined,
      passHours: rng.pick([2, 4, 6, 8, 12, 24]),
      screened: clearance === "cip" ? true : rng.bool(0.86),
      clearance,
    }
  })
}

export function buildLuggage(
  rng: Rng,
  visitors: Visitor[],
  staff: StaffMember[]
): LuggageItem[] {
  const security = staff.filter((s) => s.department === "security")
  const porters = staff.filter((s) => s.department === "frontOffice")
  const items: LuggageItem[] = []
  let counter = 4800

  for (const visitor of visitors) {
    // Deliveries and contractors almost always carry something; meetings rarely.
    const likelihood =
      visitor.purpose === "delivery"
        ? 0.95
        : visitor.purpose === "contractor"
          ? 0.8
          : visitor.purpose === "event"
            ? 0.6
            : 0.35
    const pieces = rng.bool(likelihood)
      ? rng.weighted([
          [1, 62],
          [2, 26],
          [3, 12],
        ])
      : 0

    for (let piece = 0; piece < pieces; piece++) {
      counter += rng.int(1, 4)
      const kind = rng.weighted<LuggageKind>([
        ["suitcase", 24],
        ["backpack", 22],
        ["briefcase", 20],
        ["parcel", 18],
        ["equipment", 10],
        ["garmentBag", 6],
      ])
      const state = visitor.checkedOutAt
        ? "released"
        : rng.weighted<LuggageItem["state"]>([
            ["withVisitor", 46],
            ["leftLuggage", 30],
            ["screening", 14],
            ["held", 10],
          ])
      const screened = state === "held" ? false : rng.bool(0.88)
      const checkedIn = new Date(visitor.checkedInAt)

      items.push({
        id: `lug_${items.length + 1}`,
        tag: `LUG-${counter}`,
        visitorId: visitor.id,
        kind,
        weightKg: Number(
          rng
            .float(
              kind === "parcel" ? 0.4 : 1.2,
              kind === "equipment" ? 34 : 18
            )
            .toFixed(1)
        ),
        state,
        screened,
        screenedByStaffId: screened ? rng.pick(security)?.id : undefined,
        location:
          state === "withVisitor"
            ? { en: "With visitor", bn: "দর্শনার্থীর সাথে" }
            : rng.pick(LUGGAGE_LOCATIONS),
        checkedInAt: checkedIn.toISOString(),
        releasedAt:
          state === "released" && visitor.checkedOutAt
            ? visitor.checkedOutAt
            : undefined,
        porterStaffId:
          state === "leftLuggage" ? rng.pick(porters)?.id : undefined,
      })
    }
  }

  return items
}

export function buildMovements(
  rng: Rng,
  visitors: Visitor[],
  staff: StaffMember[],
  luggage: LuggageItem[],
  vehicles: Vehicle[]
): GateMovement[] {
  const security = staff.filter((s) => s.department === "security")
  const operators = security.length ? security : staff.slice(0, 6)
  const bagsByVisitor = new Map<string, number>()
  for (const item of luggage) {
    bagsByVisitor.set(
      item.visitorId,
      (bagsByVisitor.get(item.visitorId) ?? 0) + 1
    )
  }
  const vehicleByVisitor = new Map(
    vehicles.filter((v) => v.visitorId).map((v) => [v.visitorId!, v.id])
  )

  const movements: GateMovement[] = []

  for (const visitor of visitors) {
    const bags = bagsByVisitor.get(visitor.id) ?? 0
    const vehicleId = vehicleByVisitor.get(visitor.id)
    const method = rng.weighted<GateMovement["method"]>(
      vehicleId
        ? [
            ["anpr", 34],
            ["badge", 28],
            ["qr", 20],
            ["face", 12],
            ["manual", 6],
          ]
        : [
            ["badge", 38],
            ["qr", 30],
            ["face", 18],
            ["manual", 14],
          ]
    )

    movements.push({
      id: `mov_${movements.length + 1}`,
      visitorId: visitor.id,
      direction: "in",
      gate: visitor.gate,
      at: visitor.checkedInAt,
      method,
      clearance: visitor.clearance,
      operatorStaffId: rng.pick(operators).id,
      vehicleId,
      luggageCount: bags,
      flag:
        !visitor.checkedOutAt && rng.bool(0.08)
          ? rng.pick(MOVEMENT_FLAGS)
          : undefined,
    })

    if (visitor.checkedOutAt) {
      movements.push({
        id: `mov_${movements.length + 1}`,
        visitorId: visitor.id,
        direction: "out",
        gate: rng.bool(0.78) ? visitor.gate : rng.pick(GATES),
        at: visitor.checkedOutAt,
        method,
        clearance: visitor.clearance,
        operatorStaffId: rng.pick(operators).id,
        vehicleId,
        luggageCount: bags,
        flag: rng.bool(0.05) ? rng.pick(MOVEMENT_FLAGS) : undefined,
      })
    }
  }

  return movements.sort((a, b) => b.at.localeCompare(a.at))
}

export function buildCameras(rng: Rng): Camera[] {
  const today = demoToday()

  return CAMERA_NAMES.map((entry, i) => {
    const status = rng.weighted<Camera["status"]>([
      ["live", 84],
      ["degraded", 10],
      ["offline", 6],
    ])
    return {
      id: `cam_${i + 1}`,
      code: `CAM-${String(101 + i)}`,
      name: entry.name,
      zone: CAMERA_ZONES[entry.zone],
      gate: entry.gate as GateId | undefined,
      status,
      recording: status !== "offline",
      ptz: rng.bool(0.4),
      resolution: rng.pick(["1080p", "1440p", "4K"]),
      peopleCount: status === "offline" ? 0 : rng.int(0, 14),
      lastMotionAt: addMinutes(today, -rng.int(0, 240)).toISOString(),
      frameSeed: rng.int(1, 9999),
    }
  })
}
