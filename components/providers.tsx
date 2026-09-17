"use client"

import * as React from "react"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/theme-provider"
import { UiScaleProvider } from "@/components/shell/ui-scale"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DataProvider } from "@/lib/data"
import { LocaleProvider } from "@/lib/i18n/provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" enableSystem={false}>
      <LocaleProvider>
        <DataProvider>
          <TooltipProvider delay={200}>
            <UiScaleProvider />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast:
                    "!rounded-lg !border-border !bg-popover !text-popover-foreground !text-xs",
                },
              }}
            />
          </TooltipProvider>
        </DataProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}
