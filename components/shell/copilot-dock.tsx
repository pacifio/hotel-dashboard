"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { Maximize2, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CopilotChat } from "@/components/ai/copilot-chat"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"

/** The copilot rides along with every screen, docked to the right edge. */
export function CopilotDock() {
  const { t } = useLocale()
  const open = useUi((state) => state.copilotOpen)
  const setOpen = useUi((state) => state.setCopilotOpen)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key="copilot-dock"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 40 }}
          className="relative z-20 flex h-svh shrink-0 flex-col overflow-hidden border-l border-[var(--hairline)] bg-surface"
        >
          <div className="flex w-[380px] min-w-[380px] flex-1 flex-col">
            <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3">
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-xs font-medium">{t("ai.copilot")}</span>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<Link href="/ai/copilot" />}
                >
                  <Maximize2 />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </Button>
              </div>
            </header>
            <CopilotChat compact />
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
