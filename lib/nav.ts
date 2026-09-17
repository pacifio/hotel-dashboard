import {
  Activity,
  ArrowLeftRight,
  Briefcase,
  Car,
  Crown,
  Award,
  BedDouble,
  Bot,
  Boxes,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ChartColumn,
  ClipboardCheck,
  ConciergeBell,
  CreditCard,
  Database,
  DoorOpen,
  FileText,
  Gauge,
  HandCoins,
  Headset,
  IdCard,
  Inbox,
  KanbanSquare,
  Layers,
  LayoutGrid,
  type LucideIcon,
  Megaphone,
  Package,
  Palette,
  PhoneCall,
  Plug,
  Receipt,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  Bell,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  UtensilsCrossed,
  Video,
  Wallet,
  Globe,
  Workflow,
  Wrench,
} from "lucide-react"

import type { TranslationKey } from "@/lib/i18n"

export type NavItem = {
  href: string
  labelKey: TranslationKey
  icon: LucideIcon
  children?: NavItem[]
  /** Which dataset collection to count in the badge, if any */
  countOf?:
    | "reservations"
    | "conversationsUnread"
    | "companies"
    | "contacts"
    | "deals"
    | "workOrders"
    | "visitors"
    | "staff"
  badge?: "ai" | "beta" | "live"
}

export type NavGroup = {
  id: string
  labelKey: TranslationKey
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    id: "overview",
    labelKey: "nav.groups.overview",
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: Gauge },
      { href: "/activity", labelKey: "nav.activity", icon: Activity },
    ],
  },
  {
    id: "operations",
    labelKey: "nav.groups.operations",
    items: [
      {
        href: "/front-desk",
        labelKey: "nav.frontDesk",
        icon: ConciergeBell,
        children: [
          { href: "/front-desk", labelKey: "nav.frontDesk", icon: DoorOpen },
          {
            href: "/front-desk/guest-lookup",
            labelKey: "nav.guestLookup",
            icon: Search,
          },
        ],
      },
      {
        href: "/bookings",
        labelKey: "nav.bookings",
        icon: CalendarDays,
        countOf: "reservations",
        children: [
          { href: "/bookings", labelKey: "nav.bookingList", icon: Layers },
          {
            href: "/bookings/calendar",
            labelKey: "nav.bookingCalendar",
            icon: CalendarDays,
          },
          {
            href: "/bookings/new",
            labelKey: "nav.newBooking",
            icon: CalendarPlus,
          },
          { href: "/bookings/channels", labelKey: "nav.channels", icon: Plug },
        ],
      },
      {
        href: "/rooms/rack",
        labelKey: "nav.rooms",
        icon: BedDouble,
        children: [
          { href: "/rooms/rack", labelKey: "nav.roomRack", icon: LayoutGrid },
          { href: "/rooms/status", labelKey: "nav.roomStatus", icon: DoorOpen },
          {
            href: "/rooms/housekeeping",
            labelKey: "nav.housekeeping",
            icon: Sparkles,
          },
          {
            href: "/rooms/maintenance",
            labelKey: "nav.maintenance",
            icon: Wrench,
            countOf: "workOrders",
          },
          { href: "/rooms/tariff", labelKey: "nav.tariff", icon: Tag },
        ],
      },
    ],
  },
  {
    id: "omnichannel",
    labelKey: "nav.groups.omnichannel",
    items: [
      {
        href: "/inbox",
        labelKey: "nav.inbox",
        icon: Inbox,
        countOf: "conversationsUnread",
        badge: "live",
      },
      {
        href: "/inbox/calls",
        labelKey: "nav.calls",
        icon: PhoneCall,
        badge: "ai",
      },
      { href: "/inbox/autopilot", labelKey: "nav.autopilot", icon: Headset },
    ],
  },
  {
    id: "crm",
    labelKey: "nav.groups.crm",
    items: [
      {
        href: "/crm/companies",
        labelKey: "nav.companies",
        icon: Building2,
        countOf: "companies",
      },
      {
        href: "/crm/contacts",
        labelKey: "nav.contacts",
        icon: Users,
        countOf: "contacts",
      },
      {
        href: "/crm/pipeline",
        labelKey: "nav.pipeline",
        icon: KanbanSquare,
        countOf: "deals",
      },
      { href: "/crm/segments", labelKey: "nav.segments", icon: Layers },
      { href: "/crm/campaigns", labelKey: "nav.campaigns", icon: Megaphone },
      { href: "/crm/loyalty", labelKey: "nav.loyalty", icon: Award },
    ],
  },
  {
    id: "intelligence",
    labelKey: "nav.groups.intelligence",
    items: [
      { href: "/ai/copilot", labelKey: "nav.copilot", icon: Bot, badge: "ai" },
      {
        href: "/ai/reports",
        labelKey: "nav.aiReports",
        icon: Sparkles,
        badge: "ai",
      },
      {
        href: "/ai/forecast",
        labelKey: "nav.forecast",
        icon: TrendingUp,
        badge: "ai",
      },
      { href: "/ai/agents", labelKey: "nav.agents", icon: Workflow },
      { href: "/reports", labelKey: "nav.reports", icon: ChartColumn },
    ],
  },
  {
    id: "resources",
    labelKey: "nav.groups.resources",
    items: [
      {
        href: "/inventory/stock",
        labelKey: "nav.inventory",
        icon: Package,
        children: [
          { href: "/inventory/stock", labelKey: "nav.stock", icon: Boxes },
          {
            href: "/inventory/purchase-orders",
            labelKey: "nav.purchaseOrders",
            icon: ShoppingCart,
          },
          {
            href: "/inventory/suppliers",
            labelKey: "nav.suppliers",
            icon: Truck,
          },
          {
            href: "/inventory/fnb",
            labelKey: "nav.fnb",
            icon: UtensilsCrossed,
          },
        ],
      },
      {
        href: "/staff/directory",
        labelKey: "nav.staff",
        icon: UserCog,
        countOf: "staff",
        children: [
          { href: "/staff/directory", labelKey: "nav.directory", icon: Users },
          {
            href: "/staff/roster",
            labelKey: "nav.roster",
            icon: CalendarClock,
          },
          {
            href: "/staff/attendance",
            labelKey: "nav.attendance",
            icon: ClipboardCheck,
          },
          { href: "/staff/payroll", labelKey: "nav.payroll", icon: HandCoins },
        ],
      },
      {
        href: "/visitors",
        labelKey: "nav.vms",
        icon: IdCard,
        countOf: "visitors",
        children: [
          { href: "/visitors", labelKey: "nav.vmsOverview", icon: Gauge },
          {
            href: "/visitors/movements",
            labelKey: "nav.movements",
            icon: ArrowLeftRight,
          },
          {
            href: "/visitors/log",
            labelKey: "nav.visitorLog",
            icon: ScrollText,
          },
          {
            href: "/visitors/clearance",
            labelKey: "nav.clearance",
            icon: Crown,
          },
          {
            href: "/visitors/luggage",
            labelKey: "nav.luggage",
            icon: Briefcase,
          },
          { href: "/visitors/vehicles", labelKey: "nav.vehicles", icon: Car },
          { href: "/visitors/cctv", labelKey: "nav.cctv", icon: Video },
          {
            href: "/visitors/gate-pass",
            labelKey: "nav.gatePass",
            icon: IdCard,
          },
        ],
      },
      {
        href: "/finance/folios",
        labelKey: "nav.finance",
        icon: Wallet,
        children: [
          { href: "/finance/folios", labelKey: "nav.folios", icon: FileText },
          {
            href: "/finance/invoices",
            labelKey: "nav.invoices",
            icon: Receipt,
          },
          {
            href: "/finance/payments",
            labelKey: "nav.payments",
            icon: CreditCard,
          },
          {
            href: "/finance/revenue",
            labelKey: "nav.revenue",
            icon: ChartColumn,
          },
        ],
      },
    ],
  },
  {
    id: "administration",
    labelKey: "nav.groups.administration",
    items: [
      {
        href: "/admin/properties",
        labelKey: "nav.admin",
        icon: ShieldCheck,
        children: [
          {
            href: "/admin/properties",
            labelKey: "nav.properties",
            icon: Building2,
          },
          { href: "/admin/users", labelKey: "nav.users", icon: Users },
          { href: "/admin/roles", labelKey: "nav.roles", icon: ShieldCheck },
          {
            href: "/admin/integrations",
            labelKey: "nav.integrations",
            icon: Plug,
          },
          {
            href: "/admin/audit-log",
            labelKey: "nav.auditLog",
            icon: Database,
          },
        ],
      },
      {
        href: "/settings/general",
        labelKey: "nav.settings",
        icon: Settings,
        children: [
          {
            href: "/settings/general",
            labelKey: "nav.general",
            icon: Settings,
          },
          {
            href: "/settings/localization",
            labelKey: "nav.localization",
            icon: Globe,
          },
          {
            href: "/settings/appearance",
            labelKey: "nav.appearance",
            icon: Palette,
          },
          {
            href: "/settings/notifications",
            labelKey: "nav.notifications",
            icon: Bell,
          },
        ],
      },
    ],
  },
]

/** Flat list of every leaf route, for the command palette and breadcrumbs. */
export const NAV_INDEX: {
  href: string
  labelKey: TranslationKey
  groupKey: TranslationKey
  icon: LucideIcon
}[] = NAV.flatMap((group) =>
  group.items.flatMap((item) =>
    item.children
      ? item.children.map((child) => ({
          href: child.href,
          labelKey: child.labelKey,
          groupKey: group.labelKey,
          icon: child.icon,
        }))
      : [
          {
            href: item.href,
            labelKey: item.labelKey,
            groupKey: group.labelKey,
            icon: item.icon,
          },
        ]
  )
)
