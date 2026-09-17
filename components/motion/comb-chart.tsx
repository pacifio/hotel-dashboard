"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * dashboard.jpg — the dense "comb" of 1–2px ticks. Each bar grows from the
 * baseline on a short stagger, and the whole row bleeds a soft glow of its own
 * hue into the space beneath it.
 */
export function CombChart({
  values,
  color = "var(--chart-1)",
  height = 34,
  gap = 2,
  barWidth = 2,
  glow = true,
  animate = true,
  className,
}: {
  values: number[]
  color?: string
  height?: number
  gap?: number
  barWidth?: number
  glow?: boolean
  animate?: boolean
  className?: string
}) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1

  return (
    <div
      data-slot="comb-chart"
      className={cn("relative flex items-end", className)}
      style={{ height, gap }}
    >
      {glow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-1 -bottom-2 h-6 opacity-45 blur-lg"
          style={{
            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          }}
        />
      ) : null}
      {values.map((value, index) => {
        const ratio = (value - min) / span
        // Rounded so the server-rendered inline style and motion's client value
        // serialise identically — raw floats produce hydration mismatches.
        const h = Math.round(Math.max(2, ratio * height) * 100) / 100
        const opacity =
          index === 0 ? 1 : Math.round((0.55 + ratio * 0.45) * 100) / 100
        return (
          <motion.span
            key={index}
            initial={animate ? { height: 2, opacity: 0 } : false}
            animate={{ height: h, opacity }}
            transition={{
              duration: 0.32,
              delay: animate ? index * 0.006 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative block shrink-0 rounded-full"
            style={{
              width: barWidth,
              background: color,
            }}
          />
        )
      })}
    </div>
  )
}

/** Compact inline version for table cells and KPI tiles. */
export function Sparkline({
  values,
  color = "var(--chart-1)",
  className,
}: {
  values: number[]
  color?: string
  className?: string
}) {
  return (
    <CombChart
      values={values}
      color={color}
      height={18}
      gap={2}
      barWidth={2}
      glow={false}
      className={className}
    />
  )
}

/** Smooth area sparkline, for places where a comb would be too loud. */
export function AreaSpark({
  values,
  color = "var(--chart-1)",
  width = 96,
  height = 26,
  className,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
  className?: string
}) {
  const id = React.useId()
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const step = width / Math.max(1, values.length - 1)
  const points = values.map((value, i) => {
    const x = i * step
    const y = height - ((value - min) / span) * (height - 3) - 1.5
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = `M ${points.join(" L ")}`
  const area = `${line} L ${width},${height} L 0,${height} Z`

  return (
    <svg
      data-slot="area-spark"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}
