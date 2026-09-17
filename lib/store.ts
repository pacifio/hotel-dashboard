"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DEFAULT_TENANT_ID } from "@/lib/tenants"
import * as React from "react"

import {
  DEFAULT_REPORT_RANGE,
  resolveRange,
  type ReportRange,
} from "@/lib/report-range"

export const UI_SCALE_MIN = 0.9
export const UI_SCALE_MAX = 1.4
export const UI_SCALE_STEP = 0.05

export const UI_SCALE_PRESETS = [
  { value: 0.9, labelKey: "shell.scaleCompact" },
  { value: 1, labelKey: "shell.scaleDefault" },
  { value: 1.15, labelKey: "shell.scaleLarge" },
  { value: 1.3, labelKey: "shell.scaleLarger" },
] as const

type UiState = {
  tenantId: string
  setTenantId: (id: string) => void

  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void

  copilotOpen: boolean
  setCopilotOpen: (value: boolean) => void
  toggleCopilot: () => void

  commandOpen: boolean
  setCommandOpen: (value: boolean) => void

  /** Root font-size multiplier driving --ui-scale. */
  uiScale: number
  setUiScale: (value: number) => void

  /** Global reporting window, driven by the top-bar date range picker. */
  reportRange: ReportRange
  setReportRange: (range: ReportRange) => void

  /** Conversations the demo user has manually flipped off autopilot */
  autopilotOverrides: Record<string, boolean>
  setAutopilot: (conversationId: string, value: boolean) => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      tenantId: DEFAULT_TENANT_ID,
      setTenantId: (tenantId) => set({ tenantId }),

      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      copilotOpen: false,
      setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
      toggleCopilot: () =>
        set((state) => ({ copilotOpen: !state.copilotOpen })),

      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),

      uiScale: 1,
      setUiScale: (uiScale) =>
        set({
          uiScale: Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, uiScale)),
        }),

      // Deliberately not persisted: an absolute range saved today would be
      // stale and confusing the next time the demo is opened.
      reportRange: DEFAULT_REPORT_RANGE,
      setReportRange: (reportRange) => set({ reportRange }),

      autopilotOverrides: {},
      setAutopilot: (conversationId, value) =>
        set((state) => ({
          autopilotOverrides: {
            ...state.autopilotOverrides,
            [conversationId]: value,
          },
        })),
    }),
    {
      name: "auberge.ui",
      partialize: (state) => ({
        tenantId: state.tenantId,
        sidebarCollapsed: state.sidebarCollapsed,
        uiScale: state.uiScale,
      }),
    }
  )
)

/**
 * The reporting window with presets resolved against the current day. Always
 * use this rather than reading `reportRange` straight off the store.
 */
export function useReportRange(): ReportRange {
  const stored = useUi((state) => state.reportRange)
  return React.useMemo(() => resolveRange(stored), [stored])
}
