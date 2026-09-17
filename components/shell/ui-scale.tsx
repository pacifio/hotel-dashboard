"use client"

import * as React from "react"
import { AArrowDown, AArrowUp, Check, Type } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import {
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_PRESETS,
  UI_SCALE_STEP,
  useUi,
} from "@/lib/store"
import type { TranslationKey } from "@/lib/i18n"

/**
 * Pushes the persisted scale onto the root element. Every size in the app is
 * expressed in rem, so this grows type, spacing, controls and icons together.
 */
export function UiScaleProvider() {
  const uiScale = useUi((state) => state.uiScale)

  React.useEffect(() => {
    // A corrupt or out-of-range persisted value would otherwise collapse every
    // rem in the app, so clamp on the way out rather than trusting storage.
    const safe =
      Number.isFinite(uiScale) && uiScale > 0
        ? Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, uiScale))
        : 1
    document.documentElement.style.setProperty("--ui-scale", String(safe))
    if (safe !== uiScale) useUi.getState().setUiScale(safe)
  }, [uiScale])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || !event.altKey) return
      const { uiScale: current, setUiScale } = useUi.getState()
      if (event.key === "=" || event.key === "+") {
        event.preventDefault()
        setUiScale(Number((current + UI_SCALE_STEP).toFixed(2)))
      } else if (event.key === "-") {
        event.preventDefault()
        setUiScale(Number((current - UI_SCALE_STEP).toFixed(2)))
      } else if (event.key === "0") {
        event.preventDefault()
        setUiScale(1)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return null
}

export function UiScaleControl() {
  const { t, num } = useLocale()
  const uiScale = useUi((state) => state.uiScale)
  const setUiScale = useUi((state) => state.setUiScale)

  const step = (delta: number) =>
    setUiScale(Number((uiScale + delta).toFixed(2)))

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            title={t("shell.uiScale")}
            className="gap-1"
          >
            <Type />
            <span className="nums text-[0.625rem] tabular-nums">
              {num(Math.round(uiScale * 100))}%
            </span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-[232px] gap-0 p-0">
        <div className="px-3 py-2">
          <div className="text-xs font-medium">{t("shell.uiScale")}</div>
          <p className="mt-0.5 text-[0.625rem] leading-relaxed text-muted-foreground">
            {t("shell.uiScaleHint")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 border-t border-[var(--hairline)] px-3 py-2">
          <Button
            variant="outline"
            size="icon-sm"
            title={t("shell.decrease")}
            disabled={uiScale <= UI_SCALE_MIN}
            onClick={() => step(-UI_SCALE_STEP)}
          >
            <AArrowDown />
          </Button>
          <div className="flex-1 text-center">
            <span className="nums text-sm font-medium tabular-nums">
              {num(Math.round(uiScale * 100))}%
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            title={t("shell.increase")}
            disabled={uiScale >= UI_SCALE_MAX}
            onClick={() => step(UI_SCALE_STEP)}
          >
            <AArrowUp />
          </Button>
        </div>

        <div className="flex flex-col border-t border-[var(--hairline)] p-1">
          {UI_SCALE_PRESETS.map((preset) => {
            const activePreset = Math.abs(uiScale - preset.value) < 0.001
            return (
              <button
                key={preset.value}
                onClick={() => setUiScale(preset.value)}
                className={cn(
                  "flex h-7 items-center gap-2 rounded-md px-2 text-left transition-colors",
                  activePreset
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span
                  className="w-6 shrink-0 text-center font-medium"
                  style={{ fontSize: `${preset.value * 0.8}rem` }}
                >
                  A
                </span>
                <span className="flex-1 truncate text-[0.6875rem]">
                  {t(preset.labelKey as TranslationKey)}
                </span>
                <span className="nums text-[0.625rem] text-muted-foreground">
                  {num(Math.round(preset.value * 100))}%
                </span>
                {activePreset ? (
                  <Check className="size-3 shrink-0 text-primary" />
                ) : null}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
