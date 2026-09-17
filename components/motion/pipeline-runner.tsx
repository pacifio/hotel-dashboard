"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Loader2, Play, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"

export type PipelineStep = {
  id: string
  title: string
  hint: string
  icon: React.ReactNode
  /** ms this step takes when the pipeline runs */
  duration: number
  /** Optional line of detail that types out once the step is active */
  detail?: string
  /** Renders skeleton fill bars while running, like pipeline.mp4 */
  fill?: "bars" | "bits" | "line" | "none"
}

export type PipelineState = "idle" | "running" | "done"

export function usePipeline(steps: PipelineStep[]) {
  const [state, setState] = React.useState<PipelineState>("idle")
  const [active, setActive] = React.useState(-1)
  const [elapsed, setElapsed] = React.useState(0)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = React.useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const run = React.useCallback(() => {
    clear()
    setState("running")
    setActive(0)
    setElapsed(0)
    let offset = 0
    steps.forEach((step, index) => {
      offset += step.duration
      timers.current.push(
        setTimeout(() => {
          setElapsed(offset)
          if (index === steps.length - 1) {
            setActive(steps.length)
            setState("done")
          } else {
            setActive(index + 1)
          }
        }, offset)
      )
    })
  }, [steps, clear])

  const reset = React.useCallback(() => {
    clear()
    setState("idle")
    setActive(-1)
    setElapsed(0)
  }, [clear])

  React.useEffect(() => clear, [clear])

  return { state, active, elapsed, run, reset }
}

/**
 * pipeline.mp4 — the staged agent runner. Steps light up one at a time, the
 * active step's icon fills with the accent, and skeleton content streams in
 * beneath it. This is the visual language for every agent run in the app.
 */
export function PipelineRunner({
  steps,
  title,
  state,
  active,
  elapsed,
  onRun,
  onReset,
  runLabel,
  className,
  footer,
}: {
  steps: PipelineStep[]
  title: string
  state: PipelineState
  active: number
  elapsed: number
  onRun: () => void
  onReset?: () => void
  runLabel: string
  className?: string
  footer?: React.ReactNode
}) {
  const { num } = useLocale()

  return (
    <div
      data-slot="pipeline-runner"
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <span className="text-xs font-medium">{title}</span>
        <AnimatePresence mode="popLayout">
          {elapsed > 0 ? (
            <motion.span
              key={elapsed}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="nums rounded-full bg-muted px-2 py-0.5 text-[0.625rem] text-muted-foreground"
            >
              {num(elapsed)} ms
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mx-2 flex-1 overflow-y-auto rounded-lg bg-card p-3 ring-1 ring-foreground/[0.07]">
        <ol className="relative">
          {steps.map((step, index) => {
            const status =
              index < active ? "done" : index === active ? "active" : "pending"
            const isLast = index === steps.length - 1
            return (
              <li
                key={step.id}
                className="relative flex gap-2.5 pb-4 last:pb-0"
              >
                {!isLast ? (
                  <span
                    aria-hidden
                    className="absolute top-6 bottom-0 left-[11px] w-px bg-[var(--hairline)]"
                  />
                ) : null}
                <motion.span
                  animate={{
                    backgroundColor:
                      status === "active"
                        ? "var(--primary)"
                        : status === "done"
                          ? "color-mix(in oklch, var(--success) 18%, transparent)"
                          : "var(--muted)",
                    color:
                      status === "active"
                        ? "var(--primary-foreground)"
                        : status === "done"
                          ? "var(--success)"
                          : "var(--muted-foreground)",
                    scale: status === "active" ? 1.06 : 1,
                  }}
                  transition={{ duration: 0.22 }}
                  className="relative z-10 flex size-[22px] shrink-0 items-center justify-center rounded-md"
                >
                  {status === "done" ? (
                    <Check className="size-3" />
                  ) : (
                    <span className="[&_svg]:size-3">{step.icon}</span>
                  )}
                </motion.span>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div
                    className={cn(
                      "text-xs font-medium transition-colors",
                      status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                    {step.hint}
                  </div>

                  <AnimatePresence>
                    {status !== "pending" &&
                    step.fill &&
                    step.fill !== "none" ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <StepFill
                          kind={step.fill}
                          active={status === "active"}
                          detail={step.detail}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
          {state === "running" ? (
            <>
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <span className="truncate text-primary">
                {steps[Math.min(active, steps.length - 1)]?.title}
              </span>
            </>
          ) : (
            footer
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {state === "done" && onReset ? (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw />
            </Button>
          ) : null}
          <Button size="sm" onClick={onRun} disabled={state === "running"}>
            {state === "running" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Play />
            )}
            {runLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function StepFill({
  kind,
  active,
  detail,
}: {
  kind: "bars" | "bits" | "line"
  active: boolean
  detail?: string
}) {
  if (kind === "bits") {
    // The embedding-vector strip from pipeline.mp4
    return (
      <div className="mt-2 flex items-center gap-[2px]">
        {Array.from({ length: 64 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={{
              opacity: 1,
              scaleY: 1,
              backgroundColor:
                i % 5 === 0 || i % 7 === 3
                  ? "var(--foreground)"
                  : "var(--muted)",
            }}
            transition={{ delay: i * 0.008, duration: 0.2 }}
            className="h-3 w-[3px] shrink-0 rounded-[1px]"
          />
        ))}
      </div>
    )
  }

  if (kind === "line") {
    return (
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: active ? "72%" : "100%" }}
          transition={{ duration: active ? 1.4 : 0.3, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, width: "20%" }}
          animate={{ opacity: 1, width: ["88%", "64%", "76%"][i] }}
          transition={{ delay: i * 0.12, duration: 0.35, ease: "easeOut" }}
          className="h-1.5 rounded-full bg-muted"
        />
      ))}
      {detail ? (
        <div className="pt-1 font-mono text-[0.625rem] text-muted-foreground">
          {detail}
        </div>
      ) : null}
    </div>
  )
}
