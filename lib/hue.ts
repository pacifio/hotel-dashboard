import type { TagHue } from "@/lib/types"

export const TAG_CLASS: Record<TagHue, string> = {
  blue: "tag-blue",
  teal: "tag-teal",
  green: "tag-green",
  purple: "tag-purple",
  magenta: "tag-magenta",
  amber: "tag-amber",
  rose: "tag-rose",
  slate: "tag-slate",
}

export const HUE_VAR: Record<TagHue, string> = {
  blue: "var(--hue-blue)",
  teal: "var(--hue-teal)",
  green: "var(--hue-green)",
  purple: "var(--hue-purple)",
  magenta: "var(--hue-magenta)",
  amber: "var(--hue-amber)",
  rose: "var(--hue-rose)",
  slate: "var(--hue-slate)",
}

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
]

/** Stable hue for an arbitrary key, so the same entity keeps its colour. */
export function hueFor(key: string): TagHue {
  const hues: TagHue[] = [
    "blue",
    "teal",
    "green",
    "purple",
    "magenta",
    "amber",
    "rose",
    "slate",
  ]
  let hash = 0
  for (let i = 0; i < key.length; i++)
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return hues[hash % hues.length]
}
