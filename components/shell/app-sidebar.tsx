"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
  ChevronRight,
  ExternalLink,
  Moon,
  PanelLeft,
  Search,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"

import { useMounted } from "@/hooks/use-mounted"

import { ScrollFade } from "@/components/motion/scroll-fade"
import { TenantSwitcher } from "@/components/shell/tenant-switcher"
import { cn } from "@/lib/utils"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { LOCALE_META } from "@/lib/i18n/config"
import { NAV, type NavItem } from "@/lib/nav"
import type { TranslationKey } from "@/lib/i18n"
import { useUi } from "@/lib/store"

export const SIDEBAR_W = 224
export const SIDEBAR_W_COLLAPSED = 52

export function AppSidebar() {
  const pathname = usePathname()
  const { t, num, locale, setLocale } = useLocale()
  const data = useDataset()
  const collapsed = useUi((state) => state.sidebarCollapsed)
  const uiScale = useUi((state) => state.uiScale)
  const toggleSidebar = useUi((state) => state.toggleSidebar)
  const setCommandOpen = useUi((state) => state.setCommandOpen)
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const railId = React.useId()

  const counts = React.useMemo(
    () => ({
      reservations: data.reservations.filter((r) => r.status === "confirmed")
        .length,
      conversationsUnread: data.conversations.reduce(
        (sum, c) => sum + c.unread,
        0
      ),
      companies: data.companies.length,
      contacts: data.contacts.length,
      deals: data.deals.filter((d) => !["won", "lost"].includes(d.stage))
        .length,
      workOrders: data.workOrders.filter((w) => w.state !== "completed").length,
      visitors: data.visitors.filter((v) => !v.checkedOutAt).length,
      staff: data.staff.length,
    }),
    [data]
  )

  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of NAV) {
      for (const item of group.items) {
        if (item.children?.some((child) => pathname.startsWith(child.href))) {
          initial[item.href] = true
        }
      }
    }
    return initial
  })

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href

  return (
    <motion.aside
      data-slot="app-sidebar"
      animate={{
        // The rail is a fixed pixel width, so it has to track the interface
        // scale or long labels clip at the larger sizes.
        width: (collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W) * uiScale,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 40 }}
      className="relative z-30 flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
    >
      <div className="flex items-center gap-1 p-2">
        <div className="min-w-0 flex-1">
          <TenantSwitcher collapsed={collapsed} />
        </div>
        {collapsed ? null : (
          <button
            onClick={toggleSidebar}
            title={t("shell.toggleSidebar")}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <PanelLeft className="size-3.5" />
          </button>
        )}
      </div>

      <div className="px-2 pb-2">
        <button
          onClick={() => setCommandOpen(true)}
          className={cn(
            "flex h-7 w-full items-center gap-2 rounded-md border border-sidebar-border bg-card px-2 text-[0.6875rem] text-muted-foreground transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="size-3.5 shrink-0" />
          {collapsed ? null : (
            <>
              <span className="flex-1 truncate text-left">
                {t("shell.commandHint")}
              </span>
              <kbd className="rounded border border-border bg-muted px-1 text-[0.5625rem]">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      <ScrollFade className="min-h-0 flex-1 px-2 pb-2" fade={24}>
        {NAV.map((group) => (
          <div key={group.id} className="mb-3">
            {collapsed ? (
              <div className="mx-auto mb-1.5 h-px w-5 bg-sidebar-border" />
            ) : (
              <div className="micro px-2 pb-1.5">{t(group.labelKey)}</div>
            )}
            <ul className="space-y-px">
              {group.items.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  railId={railId}
                  active={isActive}
                  pathname={pathname}
                  open={!!open[item.href]}
                  onToggle={() =>
                    setOpen((state) => ({
                      ...state,
                      [item.href]: !state[item.href],
                    }))
                  }
                  count={item.countOf ? counts[item.countOf] : undefined}
                  num={num}
                  t={t}
                />
              ))}
            </ul>
          </div>
        ))}
      </ScrollFade>

      <div
        className={cn(
          "flex items-center gap-1 border-t border-sidebar-border p-2",
          collapsed && "flex-col"
        )}
      >
        <button
          onClick={() => setLocale(locale === "en" ? "bn" : "en")}
          title={t("shell.language")}
          className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[0.625rem] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <span className="tabular-nums">{LOCALE_META[locale].short}</span>
        </button>
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title={t("shell.toggleTheme")}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="size-3.5" />
          ) : (
            <Moon className="size-3.5" />
          )}
        </button>
        {collapsed ? (
          <button
            onClick={toggleSidebar}
            title={t("shell.toggleSidebar")}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <PanelLeft className="size-3.5" />
          </button>
        ) : (
          <a
            href="https://uvtrinfotech.com/"
            target="_blank"
            rel="noreferrer"
            title={t("brand.ownedBy")}
            className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.625rem] text-muted-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {t("brand.vendor")}
            <ExternalLink className="size-2.5" />
          </a>
        )}
      </div>
    </motion.aside>
  )
}

function NavRow({
  item,
  collapsed,
  railId,
  active,
  pathname,
  open,
  onToggle,
  count,
  num,
  t,
}: {
  item: NavItem
  collapsed: boolean
  railId: string
  active: (href: string) => boolean
  pathname: string
  open: boolean
  onToggle: () => void
  count?: number
  num: (value: number) => string
  t: (key: TranslationKey) => string
}) {
  const Icon = item.icon
  const hasChildren = !!item.children?.length
  const selfActive = active(item.href)
  const branchActive =
    hasChildren && item.children!.some((child) => pathname === child.href)
  const highlighted = hasChildren
    ? // Parents are disclosures, not destinations. Only surface the branch when
      // it is collapsed, so the parent and its child never highlight together.
      (branchActive || selfActive) && (!open || collapsed)
    : selfActive

  const row = (
    <span
      className={cn(
        "relative flex h-7 w-full items-center gap-2 rounded-md px-2 text-[0.6875rem] transition-colors",
        collapsed && "justify-center px-0",
        highlighted
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      {highlighted ? (
        <motion.span
          layoutId={railId}
          transition={{ type: "spring", stiffness: 560, damping: 42 }}
          className="absolute inset-0 rounded-md bg-sidebar-accent"
        />
      ) : null}
      <Icon className="relative z-10 size-3.5 shrink-0" />
      {collapsed ? null : (
        <>
          <span className="relative z-10 flex-1 truncate text-left">
            {t(item.labelKey)}
          </span>
          {item.badge ? (
            <span
              className={cn(
                "relative z-10 rounded-full px-1 text-[0.5625rem] font-medium",
                item.badge === "ai" &&
                  "bg-[color-mix(in_oklch,var(--primary)_14%,transparent)] text-primary",
                item.badge === "live" &&
                  "bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]",
                item.badge === "beta" && "bg-muted text-muted-foreground"
              )}
            >
              {item.badge === "ai" ? "AI" : item.badge === "live" ? "●" : "β"}
            </span>
          ) : null}
          {count !== undefined && count > 0 ? (
            <span className="nums relative z-10 rounded-full bg-muted px-1 text-[0.5625rem] text-muted-foreground">
              {num(count)}
            </span>
          ) : null}
          {hasChildren ? (
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 text-muted-foreground"
            >
              <ChevronRight className="size-3" />
            </motion.span>
          ) : null}
        </>
      )}
    </span>
  )

  return (
    <li>
      {hasChildren && !collapsed ? (
        <button onClick={onToggle} className="w-full text-left outline-none">
          {row}
        </button>
      ) : (
        <Link href={item.href} title={collapsed ? t(item.labelKey) : undefined}>
          {row}
        </Link>
      )}

      {/* sidebar-nav.mp4 — children hang off an animated rail with L-connectors */}
      <AnimatePresence initial={false}>
        {hasChildren && open && !collapsed ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="relative overflow-hidden pl-[15px]"
          >
            <span className="absolute top-0 bottom-3 left-[15px] w-px bg-sidebar-border" />
            {item.children!.map((child, index) => {
              const childActive = pathname === child.href
              return (
                <motion.li
                  key={child.href}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.18 }}
                  className="relative"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1/2 left-0 h-px w-2.5 transition-colors",
                      childActive ? "bg-primary" : "bg-sidebar-border"
                    )}
                  />
                  {childActive ? (
                    <span className="absolute top-1 bottom-1 left-0 w-px bg-primary" />
                  ) : null}
                  <Link
                    href={child.href}
                    className={cn(
                      "ml-3.5 flex h-7 items-center gap-2 rounded-md px-2 text-[0.6875rem] transition-colors",
                      childActive
                        ? "bg-sidebar-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <child.icon className="size-3.5 shrink-0" />
                    <span className="truncate">{t(child.labelKey)}</span>
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  )
}
