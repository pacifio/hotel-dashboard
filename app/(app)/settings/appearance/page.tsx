"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { cn } from "@/lib/utils"
import { useMounted } from "@/hooks/use-mounted"
import { useLocale } from "@/lib/i18n/provider"
import { UI_SCALE_PRESETS, useUi } from "@/lib/store"
import type { TranslationKey } from "@/lib/i18n"
import { CHART_COLORS } from "@/lib/hue"
import type { TagHue } from "@/lib/types"

const HUES: TagHue[] = [
  "blue",
  "teal",
  "green",
  "purple",
  "magenta",
  "amber",
  "rose",
  "slate",
]

export default function AppearancePage() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const { t, num } = useLocale()
  const uiScale = useUi((state) => state.uiScale)
  const setUiScale = useUi((state) => state.setUiScale)

  const options = [
    { id: "light", label: t("settings.light"), icon: Sun },
    { id: "dark", label: t("settings.dark"), icon: Moon },
    { id: "system", label: t("settings.system"), icon: Monitor },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("settings.appearance")}
        subtitle={t("settings.theme")}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid max-w-[880px] gap-3">
          <Panel title={t("settings.theme")}>
            <div className="grid gap-2 pt-1 sm:grid-cols-3">
              {options.map((option) => {
                const active = mounted && theme === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      "flex flex-col gap-2 rounded-xl bg-surface p-3 text-left ring-1 transition-all",
                      active
                        ? "ring-2 ring-primary"
                        : "ring-foreground/[0.06] hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-16 flex-col gap-1 rounded-lg p-2",
                        option.id === "dark"
                          ? "bg-[oklch(0.145_0_0)]"
                          : option.id === "light"
                            ? "bg-[oklch(0.99_0_0)]"
                            : "bg-gradient-to-br from-[oklch(0.99_0_0)] to-[oklch(0.145_0_0)]"
                      )}
                    >
                      <span className="h-1.5 w-8 rounded-full bg-primary" />
                      <span className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
                      <span className="h-1.5 w-6 rounded-full bg-muted-foreground/25" />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <option.icon className="size-3.5" />
                      <span className="text-[0.6875rem] font-medium">
                        {option.label}
                      </span>
                      {active ? (
                        <Check className="ml-auto size-3 text-primary" />
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel title={t("shell.uiScale")} delay={0.04}>
            <p className="text-[0.6875rem] text-muted-foreground">
              {t("shell.uiScaleHint")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {UI_SCALE_PRESETS.map((preset) => {
                const active = Math.abs(uiScale - preset.value) < 0.001
                return (
                  <button
                    key={preset.value}
                    onClick={() => setUiScale(preset.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg bg-surface px-3 py-2 ring-1 transition-all",
                      active
                        ? "ring-2 ring-primary"
                        : "ring-foreground/[0.06] hover:bg-muted"
                    )}
                  >
                    <span
                      className="font-medium"
                      style={{ fontSize: `${preset.value * 0.85}rem` }}
                    >
                      A
                    </span>
                    <span className="text-[0.6875rem]">
                      {t(preset.labelKey as TranslationKey)}
                    </span>
                    <span className="nums text-[0.625rem] text-muted-foreground">
                      {num(Math.round(preset.value * 100))}%
                    </span>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel title={t("settings.density")} delay={0.05}>
            <KpiStrip
              cells={[
                {
                  id: "a",
                  label: t("dashboard.occupancy"),
                  value: 76.4,
                  suffix: "%",
                  delta: 4.2,
                  color: CHART_COLORS[0],
                },
                {
                  id: "b",
                  label: t("dashboard.adr"),
                  value: 20819,
                  prefix: "৳",
                  delta: 3.4,
                  color: CHART_COLORS[1],
                },
                {
                  id: "c",
                  label: t("dashboard.revpar"),
                  value: 15862,
                  prefix: "৳",
                  delta: -1.2,
                  color: CHART_COLORS[3],
                },
              ]}
            />
            <p className="mt-3 text-[0.6875rem] text-muted-foreground">
              {t("settings.compact")} · {t("settings.comfortable")}
            </p>
          </Panel>

          <Panel title="Palette" delay={0.1}>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {HUES.map((hue, index) => (
                <motion.span
                  key={hue}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <span
                    className="block size-7 rounded-lg"
                    style={{
                      background: `color-mix(in oklch, var(--hue-${hue}) 22%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--hue-${hue}) 40%, transparent)`,
                    }}
                    title={hue}
                  />
                </motion.span>
              ))}
            </div>
            <div className="mt-3 flex gap-1">
              {CHART_COLORS.map((color) => (
                <span
                  key={color}
                  className="h-8 flex-1 rounded-md"
                  style={{ background: color }}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
