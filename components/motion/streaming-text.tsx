"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Scripted token streaming. The whole AI layer in this prototype is mocked, so
 * rather than a fixed typewriter tick we emit variable-length chunks with
 * jittered delays — it reads like a model streaming, not like a teletype.
 */
export function useStreamedText(
  text: string,
  {
    enabled = true,
    charsPerTick = 3,
    minDelay = 12,
    maxDelay = 42,
    startDelay = 0,
    onDone,
  }: {
    enabled?: boolean
    charsPerTick?: number
    minDelay?: number
    maxDelay?: number
    startDelay?: number
    onDone?: () => void
  } = {}
) {
  const [shown, setShown] = React.useState(enabled ? "" : text)
  const doneRef = React.useRef(onDone)
  doneRef.current = onDone

  React.useEffect(() => {
    if (!enabled) {
      setShown(text)
      return
    }
    setShown("")
    let index = 0
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      // Chunk sizes wobble, and we always break on whitespace when close to one.
      const jump = charsPerTick + Math.floor(Math.random() * charsPerTick * 2)
      index = Math.min(text.length, index + jump)
      setShown(text.slice(0, index))
      if (index >= text.length) {
        doneRef.current?.()
        return
      }
      timer = setTimeout(tick, minDelay + Math.random() * (maxDelay - minDelay))
    }

    timer = setTimeout(tick, startDelay)
    return () => clearTimeout(timer)
  }, [text, enabled, charsPerTick, minDelay, maxDelay, startDelay])

  return { shown, done: shown.length >= text.length }
}

export function StreamingText({
  text,
  enabled = true,
  cursor = true,
  className,
  onDone,
  ...options
}: {
  text: string
  enabled?: boolean
  cursor?: boolean
  className?: string
  onDone?: () => void
  charsPerTick?: number
  minDelay?: number
  maxDelay?: number
  startDelay?: number
}) {
  const { shown, done } = useStreamedText(text, { enabled, onDone, ...options })
  return (
    <span
      data-slot="streaming-text"
      className={cn("whitespace-pre-wrap", className)}
    >
      {shown}
      {cursor && !done ? (
        <span className="ml-px inline-block h-3 w-[2px] translate-y-px animate-pulse rounded-full bg-primary align-middle" />
      ) : null}
    </span>
  )
}

/** Three-dot "thinking" indicator used before the first token arrives. */
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span
      data-slot="thinking-dots"
      className={cn("inline-flex items-center gap-1", className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1 animate-bounce rounded-full bg-muted-foreground/70"
          style={{ animationDelay: `${i * 120}ms`, animationDuration: "900ms" }}
        />
      ))}
    </span>
  )
}
