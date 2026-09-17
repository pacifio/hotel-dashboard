import { addDays, addMinutes, demoToday, isoDay } from "@/lib/demo-time"
import type {
  AgentRun,
  AttendanceRecord,
  AuditEntry,
  Bilingual,
  BookingSource,
  Company,
  CompanySegment,
  Contact,
  Dataset,
  Deal,
  DealStage,
  Folio,
  Guest,
  HousekeepingTask,
  InventoryItem,
  Invoice,
  Kpi,
  LoyaltyTier,
  Payment,
  PurchaseOrder,
  Reservation,
  Room,
  RoomType,
  RoomTypeId,
  SeriesPoint,
  StaffDepartment,
  StaffMember,
  Supplier,
  TagHue,
  Tenant,
  Visitor,
  VisitorPurpose,
  WorkOrder,
} from "@/lib/types"
import { createRng, type Rng } from "./rng"
import {
  AUDIT_ACTIONS,
  COMPANY_NAMES,
  CONTACT_TITLES,
  GUEST_PREFERENCES,
  HOUSEKEEPING_NOTES,
  INDUSTRIES,
  INVENTORY_ITEMS,
  MAINTENANCE_AREAS,
  MAINTENANCE_ISSUES,
  NAME_POOLS,
  NATIONALITIES,
  ROOM_VIEWS,
  STAFF_ROLES,
  SUPPLIER_NAMES,
  VISITOR_COMPANIES,
  bdName,
} from "./pools"
import { buildConversations } from "./conversations"
import { buildCalls } from "./calls"
import { buildInsights } from "./insights"
import {
  buildCameras,
  buildLuggage,
  buildMovements,
  buildVehicles,
  rollClearance,
} from "./vms"

const ROOM_TYPE_SPEC: {
  id: RoomTypeId
  hue: TagHue
  share: number
  rateUsd: number
  capacity: number
}[] = [
  { id: "standard", hue: "purple", share: 0.4, rateUsd: 120, capacity: 2 },
  { id: "deluxe", hue: "teal", share: 0.3, rateUsd: 180, capacity: 2 },
  { id: "executive", hue: "blue", share: 0.17, rateUsd: 260, capacity: 3 },
  { id: "suite", hue: "amber", share: 0.1, rateUsd: 420, capacity: 4 },
  {
    id: "presidential",
    hue: "magenta",
    share: 0.03,
    rateUsd: 900,
    capacity: 6,
  },
]

const SOURCES: [BookingSource, number][] = [
  ["direct", 22],
  ["booking.com", 18],
  ["agoda", 12],
  ["expedia", 8],
  ["airbnb", 5],
  ["corporate", 16],
  ["walkIn", 6],
  ["aiAgent", 13],
]

const SEGMENTS: CompanySegment[] = [
  "enterprise",
  "midMarket",
  "smb",
  "government",
  "ngo",
  "travelAgency",
  "airline",
  "wedding",
]

const SEGMENT_HUES: Record<CompanySegment, TagHue> = {
  enterprise: "blue",
  midMarket: "green",
  smb: "amber",
  government: "slate",
  ngo: "teal",
  travelAgency: "purple",
  airline: "magenta",
  wedding: "rose",
}

const DEPARTMENTS: StaffDepartment[] = [
  "frontOffice",
  "housekeeping",
  "fnb",
  "engineering",
  "security",
  "sales",
  "finance",
  "hr",
]

const DEAL_STAGES: DealStage[] = [
  "enquiry",
  "proposal",
  "negotiation",
  "contracted",
  "won",
  "lost",
]

const TIERS: [LoyaltyTier, number][] = [
  ["member", 50],
  ["silver", 27],
  ["gold", 16],
  ["platinum", 7],
]

function money(tenant: Tenant, usd: number) {
  return tenant.currency === "USD" ? Math.round(usd) : Math.round(usd * 118)
}

function guestName(rng: Rng, tenant: Tenant): Bilingual {
  // Dhaka and Cox's Bazar skew local; the Singapore flagship skews international.
  const localBias = tenant.currency === "USD" ? 0.35 : 0.72
  if (rng.bool(localBias)) {
    return bdName(rng.int(0, 999), rng.int(0, 999))
  }
  return rng.pick(NAME_POOLS.INTL_NAMES)
}

function slugEmail(name: string, domain: string) {
  return `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join(".")}@${domain}`
}

function bdPhone(rng: Rng) {
  return `+8801${rng.int(3, 9)}${String(rng.int(0, 99999999)).padStart(8, "0")}`
}

/* ------------------------------------------------------------------ */

function buildRoomTypes(tenant: Tenant): RoomType[] {
  let assigned = 0
  return ROOM_TYPE_SPEC.map((spec, index) => {
    const isLast = index === ROOM_TYPE_SPEC.length - 1
    const count = isLast
      ? tenant.roomCount - assigned
      : Math.max(1, Math.round(tenant.roomCount * spec.share))
    assigned += count
    return {
      id: spec.id,
      hue: spec.hue,
      baseRate: money(tenant, spec.rateUsd),
      capacity: spec.capacity,
      count,
    }
  })
}

function buildRooms(rng: Rng, tenant: Tenant, roomTypes: RoomType[]): Room[] {
  const rooms: Room[] = []
  let floor = 1
  let onFloor = 0
  const perFloor = tenant.roomCount > 200 ? 20 : 12

  for (const type of roomTypes) {
    for (let i = 0; i < type.count; i++) {
      if (onFloor >= perFloor) {
        floor += 1
        onFloor = 0
      }
      onFloor += 1
      const number = `${floor}${String(onFloor).padStart(2, "0")}`
      rooms.push({
        id: `room_${number}`,
        number,
        floor,
        typeId: type.id,
        housekeeping: rng.weighted([
          ["clean", 46],
          ["dirty", 28],
          ["inspected", 22],
          ["outOfService", 4],
        ]),
        occupied: false,
        view: rng.pick(ROOM_VIEWS),
      })
    }
  }
  return rooms
}

function buildGuests(rng: Rng, tenant: Tenant, count: number): Guest[] {
  return Array.from({ length: count }, (_, i) => {
    const name = guestName(rng, tenant)
    const stays = rng.weighted([
      [1, 40],
      [rng.int(2, 4), 32],
      [rng.int(5, 12), 20],
      [rng.int(13, 40), 8],
    ])
    return {
      id: `guest_${i + 1}`,
      name,
      email: slugEmail(
        name.en,
        rng.pick(["gmail.com", "outlook.com", "proton.me", "yahoo.com"])
      ),
      phone: bdPhone(rng),
      nationality: rng.pick(NATIONALITIES),
      tier: rng.weighted(TIERS),
      stays,
      lifetimeValue: money(tenant, stays * rng.int(180, 620)),
      preferences: rng.pickMany(GUEST_PREFERENCES, rng.int(1, 3)),
      avatarSeed: `${name.en}-${i}`,
    }
  })
}

/**
 * Walks each room's timeline day by day, so stays never overlap — the room rack
 * reads like a real occupancy chart rather than a pile of colliding bars.
 */
function buildReservations(
  rng: Rng,
  tenant: Tenant,
  rooms: Room[],
  roomTypes: RoomType[],
  guests: Guest[],
  companies: Company[]
): Reservation[] {
  const today = demoToday()
  const windowStart = -60
  const windowEnd = 75
  const reservations: Reservation[] = []
  const rateByType = new Map(roomTypes.map((t) => [t.id, t.baseRate]))
  let counter = 1000

  for (const room of rooms) {
    let cursor = windowStart - rng.int(0, 5)
    while (cursor < windowEnd) {
      // Gap before the next stay — resorts run denser than city hotels.
      const gap = rng.weighted([
        [0, tenant.kind === "resort" ? 40 : 26],
        [1, 30],
        [2, 18],
        [rng.int(3, 6), 16],
      ])
      cursor += gap
      if (cursor >= windowEnd) break

      const nights = rng.weighted([
        [1, 18],
        [2, 28],
        [3, 22],
        [rng.int(4, 6), 22],
        [rng.int(7, 14), 10],
      ])
      const checkInOffset = cursor
      const checkOutOffset = cursor + nights
      cursor = checkOutOffset

      const guest = rng.pick(guests)
      const source = rng.weighted(SOURCES)
      const base = rateByType.get(room.typeId) ?? money(tenant, 150)
      // Weekend and peak-season lift
      const checkInDate = addDays(today, checkInOffset)
      const weekend = [5, 6].includes(checkInDate.getUTCDay())
      const rate = Math.round(
        base *
          rng.float(0.86, 1.18) *
          (weekend ? 1.16 : 1) *
          (source === "direct" ? 0.96 : 1)
      )
      const total = rate * nights
      const status: Reservation["status"] =
        checkOutOffset < 0
          ? rng.weighted([
              ["checkedOut", 88],
              ["cancelled", 7],
              ["noShow", 5],
            ])
          : checkInOffset <= 0 && checkOutOffset > 0
            ? "checkedIn"
            : rng.weighted([
                ["confirmed", 82],
                ["pending", 14],
                ["cancelled", 4],
              ])

      if (status === "checkedIn") room.occupied = true

      const company = source === "corporate" ? rng.pick(companies) : undefined

      counter += rng.int(1, 4)
      reservations.push({
        id: `res_${counter}`,
        code: `${tenant.initials}${counter}`,
        guestId: guest.id,
        roomId: room.id,
        roomTypeId: room.typeId,
        checkIn: isoDay(checkInDate),
        checkOut: isoDay(addDays(today, checkOutOffset)),
        nights,
        adults: rng.weighted([
          [1, 26],
          [2, 52],
          [3, 14],
          [4, 8],
        ]),
        children: rng.weighted([
          [0, 72],
          [1, 16],
          [2, 12],
        ]),
        status,
        source,
        rate,
        total,
        paid:
          status === "checkedOut"
            ? total
            : Math.round(total * rng.pick([0, 0.3, 0.5, 1])),
        createdAt: isoDay(addDays(checkInDate, -rng.int(1, 60))),
        companyId: company?.id,
      })
    }
  }

  return reservations.sort((a, b) => a.checkIn.localeCompare(b.checkIn))
}

function buildStaff(rng: Rng, tenant: Tenant, count: number): StaffMember[] {
  const today = demoToday()
  return Array.from({ length: count }, (_, i) => {
    const department = rng.weighted<StaffDepartment>([
      ["housekeeping", 28],
      ["frontOffice", 18],
      ["fnb", 22],
      ["engineering", 9],
      ["security", 8],
      ["sales", 6],
      ["finance", 5],
      ["hr", 4],
    ])
    const name = bdName(rng.int(0, 999), rng.int(0, 999))
    return {
      id: `staff_${i + 1}`,
      name,
      role: rng.pick(STAFF_ROLES[department]),
      department,
      shift: rng.weighted([
        ["morning", 45],
        ["evening", 35],
        ["night", 20],
      ]),
      phone: bdPhone(rng),
      email: slugEmail(name.en, "auberge.app"),
      joinedAt: isoDay(addDays(today, -rng.int(40, 2400))),
      salary: money(tenant, rng.int(220, 1800)),
      avatarSeed: `${name.en}-s${i}`,
      rating: Number(rng.float(3.2, 5).toFixed(1)),
    }
  })
}

function buildAttendance(rng: Rng, staff: StaffMember[]): AttendanceRecord[] {
  const today = demoToday()
  const records: AttendanceRecord[] = []
  for (let d = 0; d < 14; d++) {
    const date = isoDay(addDays(today, -d))
    for (const member of staff) {
      const state = rng.weighted<AttendanceRecord["state"]>([
        ["present", 82],
        ["late", 8],
        ["onLeave", 6],
        ["absent", 4],
      ])
      const worked = state === "present" || state === "late"
      records.push({
        id: `att_${member.id}_${date}`,
        staffId: member.id,
        date,
        state,
        clockIn: worked
          ? `${String(rng.int(6, 15)).padStart(2, "0")}:${String(rng.int(0, 59)).padStart(2, "0")}`
          : undefined,
        clockOut: worked
          ? `${String(rng.int(15, 23)).padStart(2, "0")}:${String(rng.int(0, 59)).padStart(2, "0")}`
          : undefined,
        hours: worked ? Number(rng.float(7, 10).toFixed(1)) : 0,
      })
    }
  }
  return records
}

function buildCompanies(
  rng: Rng,
  tenant: Tenant,
  staff: StaffMember[]
): Company[] {
  const owners = staff.filter((s) => s.department === "sales")
  const ownerPool = owners.length ? owners : staff.slice(0, 4)
  return rng.shuffle(COMPANY_NAMES).map((name, i) => {
    const segment = rng.pick(SEGMENTS)
    const roomNights = rng.int(40, 2600)
    return {
      id: `co_${i + 1}`,
      name,
      segment,
      industry: rng.pick(INDUSTRIES),
      ownerId: rng.pick(ownerPool).id,
      accountValue: money(tenant, roomNights * rng.int(120, 320)),
      roomNights,
      contactCount: rng.int(1, 9),
      lastActivity: isoDay(addDays(demoToday(), -rng.int(0, 60))),
      domain: `${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      hue: SEGMENT_HUES[segment],
    }
  })
}

function buildContacts(rng: Rng, companies: Company[]): Contact[] {
  const contacts: Contact[] = []
  let i = 1
  for (const company of companies) {
    for (let c = 0; c < Math.min(company.contactCount, 4); c++) {
      const name = bdName(rng.int(0, 999), rng.int(0, 999))
      contacts.push({
        id: `contact_${i++}`,
        name,
        title: rng.pick(CONTACT_TITLES),
        companyId: company.id,
        email: slugEmail(name.en, company.domain),
        phone: bdPhone(rng),
        avatarSeed: `${name.en}-c${i}`,
        lastTouch: isoDay(addDays(demoToday(), -rng.int(0, 45))),
      })
    }
  }
  return contacts
}

const DEAL_TITLES: Bilingual[] = [
  {
    en: "Annual corporate rate agreement",
    bn: "বার্ষিক কর্পোরেট ভাড়া চুক্তি",
  },
  { en: "Q4 leadership offsite", bn: "চতুর্থ প্রান্তিকের নেতৃত্ব সম্মেলন" },
  { en: "Crew layover block", bn: "ক্রু লেওভার ব্লক" },
  { en: "Wedding weekend buyout", bn: "বিবাহের সপ্তাহান্ত বুকিং" },
  { en: "Product launch banquet", bn: "পণ্য উন্মোচন ভোজসভা" },
  { en: "Donor conference 2027", bn: "দাতা সম্মেলন ২০২৭" },
  { en: "Long-stay consultant block", bn: "দীর্ঘমেয়াদি পরামর্শক ব্লক" },
  { en: "Training academy residency", bn: "প্রশিক্ষণ একাডেমি আবাসন" },
  { en: "Board retreat", bn: "পরিচালনা পর্ষদ রিট্রিট" },
  { en: "Trade delegation stay", bn: "বাণিজ্য প্রতিনিধিদলের অবস্থান" },
]

const NEXT_ACTIONS: Bilingual[] = [
  {
    en: "Send a revised rate sheet with the 12% volume tier before Thursday.",
    bn: "বৃহস্পতিবারের আগে ১২% ভলিউম ছাড়সহ সংশোধিত ভাড়ার তালিকা পাঠান।",
  },
  {
    en: "Loop in the F&B manager — they asked about halal banquet menus.",
    bn: "খাদ্য ও পানীয় ব্যবস্থাপককে যুক্ত করুন — তারা হালাল ভোজ মেনু জানতে চেয়েছেন।",
  },
  {
    en: "Call the travel manager; last three enquiries went unanswered for 4 days.",
    bn: "ভ্রমণ ব্যবস্থাপককে কল করুন; শেষ তিনটি অনুসন্ধান ৪ দিন অনুত্তরিত।",
  },
  {
    en: "Offer a complimentary airport transfer to close the gap on rate.",
    bn: "ভাড়ার ব্যবধান কমাতে বিনামূল্যে বিমানবন্দর পরিবহন প্রস্তাব করুন।",
  },
  {
    en: "Lock the block now — competitor rates in this window dropped 8%.",
    bn: "এখনই ব্লক নিশ্চিত করুন — এই সময়ে প্রতিযোগীদের ভাড়া ৮% কমেছে।",
  },
  {
    en: "Share last year's event recap deck; the decision maker changed.",
    bn: "গত বছরের অনুষ্ঠান প্রতিবেদন পাঠান; সিদ্ধান্তগ্রহণকারী বদলেছেন।",
  },
]

function buildDeals(
  rng: Rng,
  tenant: Tenant,
  companies: Company[],
  contacts: Contact[],
  staff: StaffMember[]
): Deal[] {
  const today = demoToday()
  return Array.from({ length: 34 }, (_, i) => {
    const company = rng.pick(companies)
    const companyContacts = contacts.filter((c) => c.companyId === company.id)
    const stage = rng.weighted<DealStage>([
      ["enquiry", 26],
      ["proposal", 22],
      ["negotiation", 18],
      ["contracted", 12],
      ["won", 14],
      ["lost", 8],
    ])
    const roomNights = rng.int(20, 900)
    return {
      id: `deal_${i + 1}`,
      title: rng.pick(DEAL_TITLES),
      companyId: company.id,
      contactId: (companyContacts[0] ?? contacts[0]).id,
      ownerId: company.ownerId,
      stage,
      value: money(tenant, roomNights * rng.int(130, 300)),
      roomNights,
      probability: {
        enquiry: rng.int(5, 20),
        proposal: rng.int(25, 45),
        negotiation: rng.int(50, 75),
        contracted: rng.int(80, 95),
        won: 100,
        lost: 0,
      }[stage],
      closeDate: isoDay(addDays(today, rng.int(-30, 120))),
      createdAt: isoDay(addDays(today, -rng.int(10, 200))),
      aiNextAction: rng.pick(NEXT_ACTIONS),
    }
  })
}

function buildInventory(
  rng: Rng,
  tenant: Tenant,
  suppliers: Supplier[]
): InventoryItem[] {
  return INVENTORY_ITEMS.map((item, i) => {
    const reorderPoint = rng.int(20, 260)
    return {
      id: `inv_${i + 1}`,
      sku: `${item.category.en.slice(0, 3).toUpperCase()}-${String(1000 + i * 7)}`,
      name: item.name,
      category: item.category,
      onHand: Math.round(reorderPoint * rng.float(0.1, 3.4)),
      reorderPoint,
      unitCost: money(tenant, rng.float(0.6, 24)),
      unit: item.unit,
      supplierId: rng.pick(suppliers).id,
      updatedAt: isoDay(addDays(demoToday(), -rng.int(0, 12))),
    }
  })
}

function buildSuppliers(rng: Rng): Supplier[] {
  return SUPPLIER_NAMES.map((name, i) => ({
    id: `sup_${i + 1}`,
    name,
    category: rng.pick(INVENTORY_ITEMS).category,
    contact: bdName(rng.int(0, 999), rng.int(0, 999)),
    phone: bdPhone(rng),
    leadTimeDays: rng.int(1, 21),
    rating: Number(rng.float(3, 5).toFixed(1)),
    openOrders: rng.int(0, 6),
  }))
}

function buildPurchaseOrders(
  rng: Rng,
  tenant: Tenant,
  suppliers: Supplier[]
): PurchaseOrder[] {
  const today = demoToday()
  return Array.from({ length: 24 }, (_, i) => {
    const created = addDays(today, -rng.int(0, 70))
    return {
      id: `po_${i + 1}`,
      number: `PO-${today.getUTCFullYear()}-${String(400 + i * 3)}`,
      supplierId: rng.pick(suppliers).id,
      status: rng.weighted([
        ["draft", 12],
        ["approved", 20],
        ["ordered", 30],
        ["received", 33],
        ["cancelled", 5],
      ]),
      total: money(tenant, rng.int(180, 9400)),
      lines: rng.int(2, 18),
      createdAt: isoDay(created),
      expectedAt: isoDay(addDays(created, rng.int(3, 24))),
    }
  })
}

function buildVisitors(rng: Rng, staff: StaffMember[]): Visitor[] {
  const today = demoToday()
  const purposes: VisitorPurpose[] = [
    "meeting",
    "delivery",
    "contractor",
    "interview",
    "event",
    "personal",
  ]
  const security = staff.filter((member) => member.department === "security")
  const escorts = security.length ? security : staff.slice(0, 6)

  return Array.from({ length: 64 }, (_, i) => {
    const checkedIn = addMinutes(today, rng.int(-60 * 72, 60 * 10))
    // Almost nobody is still inside a day later — without this the "on site"
    // and overstay lists fill with visitors who arrived three days ago.
    const hoursAgo = (today.getTime() - checkedIn.getTime()) / 3_600_000
    const out = rng.bool(hoursAgo > 14 ? 0.99 : hoursAgo > 6 ? 0.85 : 0.45)
    const clearance = rollClearance(rng)
    const purpose = rng.pick(purposes)
    // Restricted visitors always need walking; CIP guests often get a host
    // escort as courtesy rather than control.
    const escortRequired =
      clearance === "restricted" || (clearance === "cip" && rng.bool(0.6))

    return {
      id: `vis_${i + 1}`,
      name: bdName(rng.int(0, 999), rng.int(0, 999)),
      company: rng.pick(VISITOR_COMPANIES),
      purpose,
      hostStaffId: rng.pick(staff).id,
      badge: `V-${String(1200 + i * 4)}`,
      checkedInAt: checkedIn.toISOString(),
      checkedOutAt: out
        ? addMinutes(checkedIn, rng.int(15, 240)).toISOString()
        : undefined,
      phone: bdPhone(rng),
      clearance,
      escortRequired,
      escortStaffId: escortRequired ? rng.pick(escorts).id : undefined,
      idType: rng.weighted([
        ["nid", 58],
        ["passport", 16],
        ["driving", 14],
        ["employeeId", 12],
      ]),
      idNumber: `${rng.int(1000, 9999)} ${rng.int(1000, 9999)} ${rng.int(1000, 9999)}`,
      expectedOutAt: addMinutes(checkedIn, rng.int(60, 300)).toISOString(),
      photoSeed: `vis-${i}-${rng.int(1, 9999)}`,
      gate:
        purpose === "delivery" || purpose === "contractor"
          ? rng.pick(["service", "basement"] as const)
          : rng.weighted([
              ["mainLobby", 48],
              ["porte", 22],
              ["banquet", 16],
              ["staff", 8],
              ["service", 6],
            ]),
    }
  })
}

function buildFinance(
  rng: Rng,
  tenant: Tenant,
  reservations: Reservation[],
  guests: Guest[]
) {
  const today = demoToday()
  const closed = reservations
    .filter((r) => r.status === "checkedOut")
    .slice(0, 60)
  const invoices: Invoice[] = closed.map((reservation, i) => {
    const issued = addDays(new Date(reservation.checkOut), 0)
    const paid = rng.weighted([
      [reservation.total, 62],
      [Math.round(reservation.total * rng.float(0.2, 0.8)), 20],
      [0, 18],
    ])
    const dueAt = addDays(issued, 21)
    const status: Invoice["status"] =
      paid >= reservation.total
        ? "paid"
        : paid > 0
          ? "partiallyPaid"
          : dueAt < today
            ? "overdue"
            : "due"
    return {
      id: `inv_${i + 1}`,
      number: `INV-${today.getUTCFullYear()}-${String(2000 + i * 3)}`,
      companyId: reservation.companyId,
      guestId: reservation.guestId,
      issuedAt: isoDay(issued),
      dueAt: isoDay(dueAt),
      amount: reservation.total,
      paid,
      status,
    }
  })

  const payments: Payment[] = invoices
    .filter((invoice) => invoice.paid > 0)
    .map((invoice, i) => ({
      id: `pay_${i + 1}`,
      invoiceId: invoice.id,
      method: rng.weighted([
        ["card", 34],
        ["bankTransfer", 22],
        ["mobileWallet", 18],
        ["corporate", 14],
        ["cash", 7],
        ["ota", 5],
      ]),
      amount: invoice.paid,
      at: isoDay(addDays(new Date(invoice.issuedAt), rng.int(0, 18))),
      reference: `TXN${rng.int(100000, 999999)}`,
    }))

  const inHouse = reservations
    .filter((r) => r.status === "checkedIn")
    .slice(0, 40)
  const folios: Folio[] = inHouse.map((reservation, i) => {
    const lines = Array.from({ length: rng.int(2, 7) }, (_, l) => {
      const department = rng.weighted<
        "rooms" | "fnb" | "spa" | "events" | "other"
      >([
        ["rooms", 40],
        ["fnb", 32],
        ["spa", 12],
        ["events", 8],
        ["other", 8],
      ])
      const description: Record<typeof department, Bilingual> = {
        rooms: { en: "Room charge", bn: "কক্ষ ভাড়া" },
        fnb: { en: "Restaurant", bn: "রেস্তোরাঁ" },
        spa: { en: "Spa treatment", bn: "স্পা সেবা" },
        events: { en: "Meeting room", bn: "সভাকক্ষ" },
        other: { en: "Laundry", bn: "লন্ড্রি" },
      }
      return {
        id: `fl_${i}_${l}`,
        description: description[department],
        department,
        amount:
          department === "rooms"
            ? reservation.rate
            : money(tenant, rng.int(8, 180)),
        at: isoDay(addDays(new Date(reservation.checkIn), l)),
      }
    })
    const balance =
      lines.reduce((sum, line) => sum + line.amount, 0) - reservation.paid
    return {
      id: `folio_${i + 1}`,
      number: `F-${String(7000 + i * 2)}`,
      reservationId: reservation.id,
      guestId: reservation.guestId,
      lines,
      balance,
      open: true,
    }
  })

  return { invoices, payments, folios }
}

function buildHousekeeping(
  rng: Rng,
  rooms: Room[],
  staff: StaffMember[]
): HousekeepingTask[] {
  const attendants = staff.filter((s) => s.department === "housekeeping")
  return rooms
    .filter((room) => room.housekeeping !== "inspected")
    .slice(0, 46)
    .map((room, i) => {
      const state = rng.weighted<HousekeepingTask["state"]>([
        ["unassigned", 30],
        ["inProgress", 32],
        ["completed", 38],
      ])
      return {
        id: `hk_${i + 1}`,
        roomId: room.id,
        state,
        assigneeId:
          state === "unassigned" ? undefined : rng.pick(attendants)?.id,
        priority: rng.weighted([
          ["low", 30],
          ["medium", 42],
          ["high", 22],
          ["critical", 6],
        ]),
        minutes: rng.int(15, 75),
        note: rng.pick(HOUSEKEEPING_NOTES),
      }
    })
}

function buildWorkOrders(
  rng: Rng,
  rooms: Room[],
  staff: StaffMember[]
): WorkOrder[] {
  const today = demoToday()
  return Array.from({ length: 22 }, (_, i) => ({
    id: `wo_${i + 1}`,
    number: `WO-${String(3100 + i * 5)}`,
    roomId: rng.bool(0.7) ? rng.pick(rooms).id : undefined,
    area: rng.pick(MAINTENANCE_AREAS),
    issue: rng.pick(MAINTENANCE_ISSUES),
    priority: rng.weighted([
      ["low", 26],
      ["medium", 40],
      ["high", 25],
      ["critical", 9],
    ]),
    state: rng.weighted([
      ["unassigned", 28],
      ["inProgress", 40],
      ["completed", 32],
    ]),
    reportedBy: rng.pick(staff).id,
    reportedAt: addMinutes(today, -rng.int(30, 60 * 24 * 12)).toISOString(),
  }))
}

function buildAudit(rng: Rng, staff: StaffMember[]): AuditEntry[] {
  const today = demoToday()
  return Array.from({ length: 60 }, (_, i) => ({
    id: `audit_${i + 1}`,
    actorId: rng.pick(staff).id,
    action: rng.pick(AUDIT_ACTIONS),
    target: rng.pick([
      "RES-8821",
      "RATE-PLAN/BAR",
      "USER/roster",
      "PO-2026-418",
      "CHANNEL/agoda",
      "FOLIO-7012",
      "REPORT/night-audit",
    ]),
    at: addMinutes(today, -rng.int(5, 60 * 24 * 20)).toISOString(),
    ip: `103.${rng.int(1, 250)}.${rng.int(1, 250)}.${rng.int(1, 250)}`,
  }))
}

/** 90 days of history plus a 90-day forecast with a widening confidence band. */
function buildSeries(rng: Rng, tenant: Tenant, locale = "en"): SeriesPoint[] {
  const today = demoToday()
  const points: SeriesPoint[] = []
  const baseOccupancy =
    tenant.kind === "resort" ? 74 : tenant.kind === "flagship" ? 81 : 69
  const baseAdr = money(tenant, tenant.kind === "flagship" ? 240 : 165)

  for (let offset = -90; offset <= 90; offset++) {
    const date = addDays(today, offset)
    const dow = date.getUTCDay()
    const weekendLift = [4, 5, 6].includes(dow) ? 11 : 0
    const seasonal = Math.sin((offset + 30) / 28) * 6
    const drift = offset * 0.035
    const noise = rng.around(0, 3.2)
    const occupancy = Math.min(
      98,
      Math.max(32, baseOccupancy + weekendLift + seasonal + drift + noise)
    )
    const adr = Math.round(
      baseAdr * (1 + weekendLift / 90 + seasonal / 160 + rng.around(0, 0.04))
    )
    const soldRooms = Math.round((occupancy / 100) * tenant.roomCount)
    const rooms = soldRooms * adr
    const isFuture = offset > 0

    points.push({
      date: isoDay(date),
      label: `${date.getUTCDate()}`,
      occupancy: Number(occupancy.toFixed(1)),
      adr,
      revpar: Math.round((occupancy / 100) * adr),
      rooms,
      fnb: Math.round(rooms * rng.float(0.28, 0.42)),
      spa: Math.round(rooms * rng.float(0.04, 0.09)),
      events: Math.round(rooms * rng.float(0.05, 0.19)),
      other: Math.round(rooms * rng.float(0.02, 0.06)),
      forecast: isFuture ? Number(occupancy.toFixed(1)) : undefined,
      lower: isFuture
        ? Number((occupancy - 2 - offset * 0.09).toFixed(1))
        : undefined,
      upper: isFuture
        ? Number((occupancy + 2 + offset * 0.09).toFixed(1))
        : undefined,
    })
  }
  return points
}

function buildKpis(rng: Rng, series: SeriesPoint[]): Kpi[] {
  const history = series.filter((_, i) => i <= 90)
  const recent = history.slice(-30)
  const previous = history.slice(-60, -30)
  const avg = (rows: SeriesPoint[], key: keyof SeriesPoint) =>
    rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0) / rows.length
  const delta = (key: keyof SeriesPoint) => {
    const now = avg(recent, key)
    const before = avg(previous, key)
    return Number((((now - before) / before) * 100).toFixed(1))
  }
  const spark = (key: keyof SeriesPoint) =>
    recent.map((row) => Number(row[key] ?? 0))

  const totalRevenue = recent.reduce(
    (sum, row) => sum + row.rooms + row.fnb + row.spa + row.events + row.other,
    0
  )
  const prevRevenue = previous.reduce(
    (sum, row) => sum + row.rooms + row.fnb + row.spa + row.events + row.other,
    0
  )

  return [
    {
      id: "occupancy",
      labelKey: "dashboard.occupancy",
      value: Number(avg(recent, "occupancy").toFixed(1)),
      delta: delta("occupancy"),
      format: "percent",
      spark: spark("occupancy"),
    },
    {
      id: "adr",
      labelKey: "dashboard.adr",
      value: Math.round(avg(recent, "adr")),
      delta: delta("adr"),
      format: "currency",
      spark: spark("adr"),
    },
    {
      id: "revpar",
      labelKey: "dashboard.revpar",
      value: Math.round(avg(recent, "revpar")),
      delta: delta("revpar"),
      format: "currency",
      spark: spark("revpar"),
    },
    {
      id: "totalRevenue",
      labelKey: "dashboard.totalRevenue",
      value: totalRevenue,
      delta: Number(
        (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
      ),
      format: "currency",
      spark: recent.map(
        (row) => row.rooms + row.fnb + row.spa + row.events + row.other
      ),
    },
  ]
}

function buildAgentRuns(rng: Rng): AgentRun[] {
  const today = demoToday()
  const agents: Bilingual[] = [
    { en: "Booking agent", bn: "বুকিং এজেন্ট" },
    { en: "Revenue analyst", bn: "রাজস্ব বিশ্লেষক" },
    { en: "Voice concierge", bn: "ভয়েস কনসিয়ার্জ" },
    { en: "Report composer", bn: "রিপোর্ট রচয়িতা" },
    { en: "Upsell agent", bn: "আপসেল এজেন্ট" },
    { en: "Housekeeping dispatcher", bn: "হাউসকিপিং প্রেরক" },
  ]
  const triggers: Bilingual[] = [
    { en: "Inbound WhatsApp message", bn: "আগত হোয়াটসঅ্যাপ বার্তা" },
    { en: "Inbound call", bn: "আগত কল" },
    { en: "Scheduled 06:00 digest", bn: "নির্ধারিত ৬টার সারসংক্ষেপ" },
    { en: "Rate parity alert", bn: "ভাড়ার সমতা সতর্কতা" },
    { en: "Checkout completed", bn: "চেক-আউট সম্পন্ন" },
    { en: "Manual run from studio", bn: "স্টুডিও থেকে ম্যানুয়াল রান" },
  ]
  return Array.from({ length: 28 }, (_, i) => ({
    id: `run_${i + 1}`,
    agent: rng.pick(agents),
    trigger: rng.pick(triggers),
    status: rng.weighted([
      ["success", 74],
      ["escalated", 14],
      ["running", 7],
      ["failed", 5],
    ]),
    startedAt: addMinutes(today, -rng.int(2, 60 * 36)).toISOString(),
    durationMs: rng.int(420, 18400),
    tokens: rng.int(340, 24000),
    steps: rng.int(3, 11),
    channel: rng.bool(0.6)
      ? rng.pick(["whatsapp", "voice", "email", "sms", "webchat"] as const)
      : undefined,
  }))
}

/* ------------------------------------------------------------------ */

export function generateDataset(tenant: Tenant): Dataset {
  const rng = createRng(tenant.slug)

  const roomTypes = buildRoomTypes(tenant)
  const rooms = buildRooms(rng, tenant, roomTypes)
  const guests = buildGuests(rng, tenant, Math.round(tenant.roomCount * 2.6))
  const staff = buildStaff(rng, tenant, Math.round(tenant.roomCount * 0.55))
  const companies = buildCompanies(rng, tenant, staff)
  const contacts = buildContacts(rng, companies)
  const deals = buildDeals(rng, tenant, companies, contacts, staff)
  const reservations = buildReservations(
    rng,
    tenant,
    rooms,
    roomTypes,
    guests,
    companies
  )
  const suppliers = buildSuppliers(rng)
  const inventory = buildInventory(rng, tenant, suppliers)
  const purchaseOrders = buildPurchaseOrders(rng, tenant, suppliers)
  const visitors = buildVisitors(rng, staff)
  const vehicles = buildVehicles(
    rng,
    visitors,
    Math.round(visitors.length * 0.55)
  )
  const luggage = buildLuggage(rng, visitors, staff)
  const movements = buildMovements(rng, visitors, staff, luggage, vehicles)
  const cameras = buildCameras(rng)

  // Link each visitor back to the vehicle they arrived in.
  for (const vehicle of vehicles) {
    if (!vehicle.visitorId) continue
    const visitor = visitors.find((v) => v.id === vehicle.visitorId)
    if (visitor && !visitor.vehicleId) visitor.vehicleId = vehicle.id
  }
  const { invoices, payments, folios } = buildFinance(
    rng,
    tenant,
    reservations,
    guests
  )
  const series = buildSeries(rng, tenant)

  return {
    tenant,
    roomTypes,
    rooms,
    guests,
    reservations,
    staff,
    attendance: buildAttendance(rng, staff),
    companies,
    contacts,
    deals,
    conversations: buildConversations(rng, tenant, guests, staff, roomTypes),
    calls: buildCalls(rng, tenant, guests),
    inventory,
    suppliers,
    purchaseOrders,
    visitors,
    movements,
    luggage,
    vehicles,
    cameras,
    invoices,
    payments,
    folios,
    housekeeping: buildHousekeeping(rng, rooms, staff),
    workOrders: buildWorkOrders(rng, rooms, staff),
    audit: buildAudit(rng, staff),
    series,
    kpis: buildKpis(rng, series),
    insights: buildInsights(rng, tenant, series),
    agentRuns: buildAgentRuns(rng),
  }
}
