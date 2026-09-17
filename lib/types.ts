export type Bilingual = { en: string; bn: string }

export type TagHue =
  "blue" | "teal" | "green" | "purple" | "magenta" | "amber" | "rose" | "slate"

/* ------------------------------------------------------------------ *
 * Tenancy
 * ------------------------------------------------------------------ */

export type Tenant = {
  id: string
  slug: string
  name: Bilingual
  city: Bilingual
  country: Bilingual
  kind: "business" | "resort" | "flagship"
  currency: "BDT" | "USD"
  timezone: string
  roomCount: number
  stars: 4 | 5
  hue: TagHue
  initials: string
  established: number
}

/* ------------------------------------------------------------------ *
 * Rooms & reservations
 * ------------------------------------------------------------------ */

export type RoomTypeId =
  "standard" | "deluxe" | "executive" | "suite" | "presidential"

export type RoomType = {
  id: RoomTypeId
  hue: TagHue
  baseRate: number
  capacity: number
  count: number
}

export type HousekeepingState = "clean" | "dirty" | "inspected" | "outOfService"

export type Room = {
  id: string
  number: string
  floor: number
  typeId: RoomTypeId
  housekeeping: HousekeepingState
  occupied: boolean
  view: Bilingual
}

export type ReservationStatus =
  "confirmed" | "pending" | "checkedIn" | "checkedOut" | "cancelled" | "noShow"

export type BookingSource =
  | "direct"
  | "booking.com"
  | "agoda"
  | "expedia"
  | "airbnb"
  | "corporate"
  | "walkIn"
  | "aiAgent"

export type Reservation = {
  id: string
  code: string
  guestId: string
  roomId: string
  roomTypeId: RoomTypeId
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  status: ReservationStatus
  source: BookingSource
  rate: number
  total: number
  paid: number
  createdAt: string
  companyId?: string
  notes?: string
}

/* ------------------------------------------------------------------ *
 * People
 * ------------------------------------------------------------------ */

export type LoyaltyTier = "member" | "silver" | "gold" | "platinum"

export type Guest = {
  id: string
  name: Bilingual
  email: string
  phone: string
  nationality: Bilingual
  tier: LoyaltyTier
  stays: number
  lifetimeValue: number
  preferences: Bilingual[]
  avatarSeed: string
  companyId?: string
}

export type StaffDepartment =
  | "frontOffice"
  | "housekeeping"
  | "fnb"
  | "engineering"
  | "security"
  | "sales"
  | "finance"
  | "hr"

export type ShiftId = "morning" | "evening" | "night"

export type StaffMember = {
  id: string
  name: Bilingual
  role: Bilingual
  department: StaffDepartment
  shift: ShiftId
  phone: string
  email: string
  joinedAt: string
  salary: number
  avatarSeed: string
  rating: number
}

export type AttendanceState = "present" | "absent" | "late" | "onLeave"

export type AttendanceRecord = {
  id: string
  staffId: string
  date: string
  state: AttendanceState
  clockIn?: string
  clockOut?: string
  hours: number
}

/* ------------------------------------------------------------------ *
 * CRM
 * ------------------------------------------------------------------ */

export type CompanySegment =
  | "enterprise"
  | "midMarket"
  | "smb"
  | "government"
  | "ngo"
  | "travelAgency"
  | "airline"
  | "wedding"

export type Company = {
  id: string
  name: string
  segment: CompanySegment
  industry: Bilingual
  ownerId: string
  accountValue: number
  roomNights: number
  contactCount: number
  lastActivity: string
  domain: string
  hue: TagHue
}

export type Contact = {
  id: string
  name: Bilingual
  title: Bilingual
  companyId: string
  email: string
  phone: string
  avatarSeed: string
  lastTouch: string
}

export type DealStage =
  "enquiry" | "proposal" | "negotiation" | "contracted" | "won" | "lost"

export type Deal = {
  id: string
  title: Bilingual
  companyId: string
  contactId: string
  ownerId: string
  stage: DealStage
  value: number
  roomNights: number
  probability: number
  closeDate: string
  createdAt: string
  aiNextAction: Bilingual
}

/* ------------------------------------------------------------------ *
 * Omnichannel inbox
 * ------------------------------------------------------------------ */

export type ChannelId =
  "whatsapp" | "messenger" | "instagram" | "sms" | "email" | "voice" | "webchat"

export type ConversationState = "aiHandled" | "needsHuman" | "resolved"

export type MessageAuthor = "guest" | "ai" | "agent" | "system"

export type Message = {
  id: string
  author: MessageAuthor
  body: Bilingual
  at: string
  confidence?: number
  attachment?: {
    kind: "booking" | "invoice" | "roomOptions"
    payload: Record<string, string | number>
  }
}

export type Conversation = {
  id: string
  channel: ChannelId
  guestId: string
  subject: Bilingual
  preview: Bilingual
  state: ConversationState
  unread: number
  autopilot: boolean
  slaSeconds: number
  updatedAt: string
  assigneeId?: string
  messages: Message[]
}

export type CallTurn = {
  id: string
  speaker: "ai" | "caller"
  text: Bilingual
  atMs: number
}

export type CallRecord = {
  id: string
  guestId: string
  direction: "inbound" | "outbound"
  language: "en" | "bn"
  startedAt: string
  durationSeconds: number
  outcome: "booked" | "enquiry" | "escalated" | "missed"
  sentiment: number
  intent: Bilingual
  turns: CallTurn[]
}

/* ------------------------------------------------------------------ *
 * Inventory & procurement
 * ------------------------------------------------------------------ */

export type InventoryItem = {
  id: string
  sku: string
  name: Bilingual
  category: Bilingual
  onHand: number
  reorderPoint: number
  unitCost: number
  unit: Bilingual
  supplierId: string
  updatedAt: string
}

export type Supplier = {
  id: string
  name: Bilingual
  category: Bilingual
  contact: Bilingual
  phone: string
  leadTimeDays: number
  rating: number
  openOrders: number
}

export type PurchaseOrderStatus =
  "draft" | "approved" | "ordered" | "received" | "cancelled"

export type PurchaseOrder = {
  id: string
  number: string
  supplierId: string
  status: PurchaseOrderStatus
  total: number
  lines: number
  createdAt: string
  expectedAt: string
}

/* ------------------------------------------------------------------ *
 * Visitors
 * ------------------------------------------------------------------ */

export type VisitorPurpose =
  "meeting" | "delivery" | "contractor" | "interview" | "event" | "personal"

/**
 * Escalated access. CIP (Commercially Important Person) sits above VIP in
 * hospitality: a CIP is a revenue-critical account contact, so they clear
 * faster and carry more entitlements than a VIP courtesy guest.
 */
export type ClearanceLevel = "standard" | "vip" | "cip" | "restricted"

export type GateId =
  "mainLobby" | "porte" | "service" | "basement" | "banquet" | "staff"

export type Visitor = {
  id: string
  name: Bilingual
  company: Bilingual
  purpose: VisitorPurpose
  hostStaffId: string
  badge: string
  checkedInAt: string
  checkedOutAt?: string
  vehicleId?: string
  phone: string
  clearance: ClearanceLevel
  /** Restricted and some CIP visitors must be walked by a staff escort. */
  escortRequired: boolean
  escortStaffId?: string
  idType: "nid" | "passport" | "driving" | "employeeId"
  idNumber: string
  expectedOutAt?: string
  photoSeed: string
  gate: GateId
}

/* ------------------------------------------------------------------ *
 * Visitor management — movements, belongings, surveillance
 * ------------------------------------------------------------------ */

export type MovementMethod = "badge" | "qr" | "manual" | "face" | "anpr"

export type GateMovement = {
  id: string
  visitorId: string
  direction: "in" | "out"
  gate: GateId
  at: string
  method: MovementMethod
  clearance: ClearanceLevel
  operatorStaffId: string
  vehicleId?: string
  luggageCount: number
  /** Present when the movement tripped a rule — overstay, unscreened bag, etc. */
  flag?: Bilingual
}

export type LuggageKind =
  "suitcase" | "backpack" | "briefcase" | "garmentBag" | "equipment" | "parcel"

export type LuggageState =
  "withVisitor" | "leftLuggage" | "screening" | "held" | "released"

export type LuggageItem = {
  id: string
  tag: string
  visitorId: string
  kind: LuggageKind
  weightKg: number
  state: LuggageState
  screened: boolean
  screenedByStaffId?: string
  location: Bilingual
  checkedInAt: string
  releasedAt?: string
  porterStaffId?: string
}

export type VehicleType = "car" | "suv" | "van" | "motorcycle" | "bus" | "truck"

export type Vehicle = {
  id: string
  plate: Bilingual
  type: VehicleType
  make: string
  colour: Bilingual
  driver: Bilingual
  visitorId?: string
  bay?: string
  entryAt: string
  exitAt?: string
  /** Gate pass validity in hours from entry. */
  passHours: number
  screened: boolean
  clearance: ClearanceLevel
}

export type CameraStatus = "live" | "degraded" | "offline"

export type Camera = {
  id: string
  code: string
  name: Bilingual
  zone: Bilingual
  gate?: GateId
  status: CameraStatus
  recording: boolean
  ptz: boolean
  resolution: string
  /** Mocked analytics readouts for the monitor wall overlays. */
  peopleCount: number
  lastMotionAt: string
  /** Drives the deterministic synthetic frame rendered in each tile. */
  frameSeed: number
}

/* ------------------------------------------------------------------ *
 * Finance
 * ------------------------------------------------------------------ */

export type PaymentMethod =
  "card" | "cash" | "bankTransfer" | "mobileWallet" | "corporate" | "ota"

export type InvoiceStatus = "paid" | "due" | "overdue" | "partiallyPaid"

export type Invoice = {
  id: string
  number: string
  companyId?: string
  guestId: string
  issuedAt: string
  dueAt: string
  amount: number
  paid: number
  status: InvoiceStatus
}

export type Payment = {
  id: string
  invoiceId: string
  method: PaymentMethod
  amount: number
  at: string
  reference: string
}

export type FolioLine = {
  id: string
  description: Bilingual
  department: "rooms" | "fnb" | "spa" | "events" | "other"
  amount: number
  at: string
}

export type Folio = {
  id: string
  number: string
  reservationId: string
  guestId: string
  lines: FolioLine[]
  balance: number
  open: boolean
}

/* ------------------------------------------------------------------ *
 * Tasks, maintenance & audit
 * ------------------------------------------------------------------ */

export type TaskPriority = "low" | "medium" | "high" | "critical"
export type TaskState = "unassigned" | "inProgress" | "completed"

export type HousekeepingTask = {
  id: string
  roomId: string
  state: TaskState
  assigneeId?: string
  priority: TaskPriority
  minutes: number
  note: Bilingual
}

export type WorkOrder = {
  id: string
  number: string
  roomId?: string
  area: Bilingual
  issue: Bilingual
  priority: TaskPriority
  state: TaskState
  reportedBy: string
  reportedAt: string
}

export type AuditEntry = {
  id: string
  actorId: string
  action: Bilingual
  target: string
  at: string
  ip: string
}

/* ------------------------------------------------------------------ *
 * Metrics & AI
 * ------------------------------------------------------------------ */

export type SeriesPoint = {
  date: string
  label: string
  occupancy: number
  adr: number
  revpar: number
  rooms: number
  fnb: number
  spa: number
  events: number
  other: number
  forecast?: number
  lower?: number
  upper?: number
}

export type Kpi = {
  id: string
  labelKey: string
  value: number
  delta: number
  format: "percent" | "currency" | "number"
  spark: number[]
}

export type AiInsightKind = "pricing" | "risk" | "opportunity" | "operations"

export type AiInsight = {
  id: string
  kind: AiInsightKind
  hue: TagHue
  title: Bilingual
  body: Bilingual
  impact: number
  confidence: number
  action: Bilingual
}

export type AgentRunStatus = "success" | "running" | "escalated" | "failed"

export type AgentRun = {
  id: string
  agent: Bilingual
  trigger: Bilingual
  status: AgentRunStatus
  startedAt: string
  durationMs: number
  tokens: number
  steps: number
  channel?: ChannelId
}

/* ------------------------------------------------------------------ *
 * The full per-tenant dataset
 * ------------------------------------------------------------------ */

export type Dataset = {
  tenant: Tenant
  roomTypes: RoomType[]
  rooms: Room[]
  guests: Guest[]
  reservations: Reservation[]
  staff: StaffMember[]
  attendance: AttendanceRecord[]
  companies: Company[]
  contacts: Contact[]
  deals: Deal[]
  conversations: Conversation[]
  calls: CallRecord[]
  inventory: InventoryItem[]
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  visitors: Visitor[]
  movements: GateMovement[]
  luggage: LuggageItem[]
  vehicles: Vehicle[]
  cameras: Camera[]
  invoices: Invoice[]
  payments: Payment[]
  folios: Folio[]
  housekeeping: HousekeepingTask[]
  workOrders: WorkOrder[]
  audit: AuditEntry[]
  series: SeriesPoint[]
  kpis: Kpi[]
  insights: AiInsight[]
  agentRuns: AgentRun[]
}
