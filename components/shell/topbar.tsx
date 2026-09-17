"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { Bell, ChevronRight, LogOut, Sparkles, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar } from "@/components/motion/avatar-stack"
import { DateRangePicker } from "@/components/shell/date-range-picker"
import { UiScaleControl } from "@/components/shell/ui-scale"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { cn } from "@/lib/utils"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { NAV, NAV_INDEX } from "@/lib/nav"
import { useUi } from "@/lib/store"

export function Topbar() {
  const pathname = usePathname()
  const { t, locale, date, relative, num } = useLocale()
  const data = useDataset()
  const toggleCopilot = useUi((state) => state.toggleCopilot)
  const [readAll, setReadAll] = React.useState(false)

  const crumbs = React.useMemo(() => {
    const leaf = NAV_INDEX.find((entry) => entry.href === pathname)
    if (leaf) return [t(leaf.groupKey), t(leaf.labelKey)]
    for (const group of NAV) {
      for (const item of group.items) {
        if (pathname.startsWith(item.href) && item.href !== "/") {
          return [t(group.labelKey), t(item.labelKey)]
        }
      }
    }
    return [t("brand.name")]
  }, [pathname, t])

  const notifications = React.useMemo(
    () =>
      data.agentRuns.slice(0, 8).map((run) => ({
        id: run.id,
        title: run.agent[locale],
        body: run.trigger[locale],
        at: run.startedAt,
        status: run.status,
      })),
    [data.agentRuns, locale]
  )

  const unread = readAll ? 0 : Math.min(5, notifications.length)

  return (
    <header
      data-slot="topbar"
      className="glass sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-4"
    >
      <nav className="flex min-w-0 items-center gap-1 text-[0.6875rem] text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 ? (
              <ChevronRight className="size-3 shrink-0 opacity-50" />
            ) : null}
            <span
              className={cn(
                "truncate",
                index === crumbs.length - 1 && "text-foreground"
              )}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <DateRangePicker />

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon" className="relative">
                <Bell />
                {unread > 0 ? (
                  <span className="nums absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[0.5rem] font-medium text-primary-foreground">
                    {num(unread)}
                  </span>
                ) : null}
              </Button>
            }
          />
          <PopoverContent align="end" className="w-[300px] gap-0 p-0">
            <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
              <span className="text-xs font-medium">
                {t("shell.notifications")}
              </span>
              <button
                onClick={() => setReadAll(true)}
                className="text-[0.625rem] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("shell.markAllRead")}
              </button>
            </div>
            <ScrollFade className="max-h-[300px] border-t border-[var(--hairline)]">
              {notifications.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex gap-2 border-b border-[var(--hairline)] px-3 py-2 last:border-0 hover:bg-muted/60"
                >
                  <span
                    className={cn(
                      "mt-1 size-1.5 shrink-0 rounded-full",
                      item.status === "success" && "bg-[var(--success)]",
                      item.status === "escalated" && "bg-[var(--warning)]",
                      item.status === "failed" && "bg-[var(--destructive)]",
                      item.status === "running" && "animate-pulse bg-primary"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.6875rem] font-medium">
                      {item.title}
                    </div>
                    <div className="truncate text-[0.625rem] text-muted-foreground">
                      {item.body}
                    </div>
                  </div>
                  <span className="shrink-0 text-[0.625rem] whitespace-nowrap text-muted-foreground">
                    {relative(item.at)}
                  </span>
                </motion.div>
              ))}
            </ScrollFade>
          </PopoverContent>
        </Popover>

        <Button size="sm" variant="secondary" onClick={toggleCopilot}>
          <Sparkles />
          {t("nav.copilot")}
          <kbd className="ml-0.5 rounded border border-border/70 px-1 text-[0.5625rem] opacity-70">
            ⌘J
          </kbd>
        </Button>

        <UiScaleControl />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar name="Adib Mohsin" seed="adib" size={26} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Avatar name="Adib Mohsin" seed="adib" size={24} />
                <span className="min-w-0">
                  <span className="block truncate text-xs">Adib Mohsin</span>
                  <span className="block truncate text-[0.625rem] text-muted-foreground">
                    General Manager
                  </span>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-3.5" />
              {t("shell.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="size-3.5" />
              {t("shell.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
