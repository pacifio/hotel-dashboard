"use client"

import * as React from "react"
import { RotateCcw, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--destructive)_14%,transparent)] text-[var(--destructive)]">
        <TriangleAlert className="size-5" />
      </span>
      <p className="text-sm font-medium">Something went wrong</p>
      <p className="max-w-[46ch] font-mono text-[0.6875rem] text-muted-foreground">
        {error.message}
      </p>
      <Button size="sm" onClick={reset} className="mt-1">
        <RotateCcw />
        Try again
      </Button>
    </div>
  )
}
