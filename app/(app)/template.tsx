"use client"

import * as React from "react"
import { motion } from "motion/react"

/**
 * Page transition.
 *
 * This lives in a template rather than the layout because Next gives templates
 * a fresh key on every navigation, so the enter animation runs on mount without
 * needing AnimatePresence. The previous approach — `AnimatePresence mode="wait"`
 * keyed on the pathname — intermittently left the incoming page stuck at its
 * `initial` style (mounted, but opacity 0) when the outgoing exit and the
 * incoming mount landed in the same frame, which read as a blank screen until
 * a reload.
 */
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="flex h-full min-h-0 flex-col"
    >
      {children}
    </motion.div>
  )
}
