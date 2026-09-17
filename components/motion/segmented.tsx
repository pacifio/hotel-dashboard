"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export type SegmentOption<T extends string> = {
  value: T
  label: React.ReactNode
  count?: React.ReactNode
  icon?: React.ReactNode
}

/**
 * dashboard.jpg — the horizontal chip rail. The active pill is a single shared
 * layout element that slides between chips instead of cross-fading.
 */
export function SegmentedPills<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "default",
  id,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  size?: "sm" | "default"
  id?: string
}) {
  const layoutId = React.useId()
  return (
    <div
      data-slot="segmented-pills"
      role="tablist"
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
      id={id}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative shrink-0 rounded-full font-medium whitespace-nowrap transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring/40",
              size === "sm" ? "h-6 px-2.5 text-[0.6875rem]" : "h-7 px-3 text-xs",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.icon}
              {option.label}
              {option.count !== undefined ? (
                <span
                  className={cn(
                    "nums rounded-full px-1 text-[0.625rem] tabular-nums",
                    active
                      ? "bg-primary-foreground/20"
                      : "bg-muted-foreground/12 text-muted-foreground"
                  )}
                >
                  {option.count}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** crm.jpg — page-level underline tabs with a sliding indicator. */
export function UnderlineTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  const layoutId = React.useId()
  return (
    <div
      data-slot="underline-tabs"
      role="tablist"
      className={cn("flex items-center gap-4", className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center gap-1.5 pb-2 text-xs font-medium transition-colors outline-none",
              "focus-visible:text-foreground",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined ? (
              <span className="nums rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
                {option.count}
              </span>
            ) : null}
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** crm.jpg — the compound `gray label │ value ⌄` toolbar pill. */
export function CompoundFilter({
  label,
  children,
  className,
  onClick,
}: {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      data-slot="compound-filter"
      onClick={onClick}
      className={cn(
        "group inline-flex h-7 shrink-0 items-center overflow-hidden rounded-full border border-border bg-card text-xs transition-colors hover:bg-muted",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        className
      )}
    >
      <span className="border-r border-border/70 px-2.5 text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1 px-2.5 font-medium">
        {children}
      </span>
    </button>
  )
}
