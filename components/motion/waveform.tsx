"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Live audio bars for the AI voice call. Deterministic per-bar phase so the
 * motion looks like speech rather than noise, and it idles flat when nobody is
 * speaking.
 */
export function Waveform({
  active = true,
  bars = 48,
  color = "var(--primary)",
  height = 40,
  className,
}: {
  active?: boolean
  bars?: number
  color?: string
  height?: number
  className?: string
}) {
  const phases = React.useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => ({
        delay: (i % 11) * 0.06,
        peak: 0.25 + ((i * 37) % 100) / 130,
      })),
    [bars]
  )

  return (
    <div
      data-slot="waveform"
      className={cn("flex items-center justify-center gap-[3px]", className)}
      style={{ height }}
    >
      {phases.map((phase, i) => (
        <motion.span
          key={i}
          animate={
            active
              ? { scaleY: [0.18, phase.peak, 0.3, phase.peak * 0.7, 0.18] }
              : { scaleY: 0.1 }
          }
          transition={
            active
              ? {
                  duration: 1.1,
                  repeat: Infinity,
                  delay: phase.delay,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          className="w-[3px] shrink-0 rounded-full"
          style={{ height, background: color, transformOrigin: "center" }}
        />
      ))}
    </div>
  )
}

/** Horizontal confidence / sentiment meter with a coloured fill. */
export function Meter({
  value,
  label,
  tone = "primary",
  className,
}: {
  value: number
  label?: React.ReactNode
  tone?: "primary" | "success" | "warning" | "destructive"
  className?: string
}) {
  const color = {
    primary: "var(--primary)",
    success: "var(--success)",
    warning: "var(--warning)",
    destructive: "var(--destructive)",
  }[tone]

  return (
    <div data-slot="meter" className={cn("flex items-center gap-2", className)}>
      {label ? (
        <span className="shrink-0 text-[0.625rem] text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="nums shrink-0 text-[0.625rem] text-muted-foreground tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}
