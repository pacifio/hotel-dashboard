"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ArrowUpRight, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * dashboard.jpg — every card carries a top-right action cluster: a neutral
 * circular secondary and an accent circular primary with an ↗ arrow.
 */
export function Panel({
  title,
  subtitle,
  actions,
  onExpand,
  onFilter,
  className,
  bodyClassName,
  children,
  delay = 0,
}: {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  onExpand?: () => void
  onFilter?: () => void
  className?: string
  bodyClassName?: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.section
      data-slot="panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      {title || actions || onExpand ? (
        <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
          <div className="min-w-0">
            {title ? (
              <h3 className="truncate text-xs font-medium">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            {onFilter ? (
              <button
                onClick={onFilter}
                className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <SlidersHorizontal className="size-3" />
              </button>
            ) : null}
            {onExpand ? (
              <button
                onClick={onExpand}
                className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <ArrowUpRight className="size-3" />
              </button>
            ) : null}
          </div>
        </header>
      ) : null}
      <div className={cn("min-h-0 flex-1 px-4 pt-1 pb-4", bodyClassName)}>
        {children}
      </div>
    </motion.section>
  )
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 px-5 pt-4 pb-3",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl font-medium tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex shrink-0 items-center gap-1.5">{children}</div>
      ) : null}
    </header>
  )
}

export function EmptyState({
  icon,
  title,
  hint,
  className,
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  hint?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center",
        className
      )}
    >
      {icon ? (
        <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-4">
          {icon}
        </div>
      ) : null}
      <p className="text-xs font-medium">{title}</p>
      {hint ? (
        <p className="max-w-[34ch] text-[0.6875rem] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
