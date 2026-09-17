"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUp, BookOpen, Bot, RotateCcw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StreamingText, ThinkingDots } from "@/components/motion/streaming-text"
import { Avatar } from "@/components/motion/avatar-stack"
import { ToolCallCard } from "@/components/ai/tool-call-card"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { useTenant } from "@/lib/data"
import {
  routeAnswer,
  SUGGESTED_PROMPTS,
  type CopilotAnswer,
} from "@/lib/ai/copilot"

type Turn = {
  id: string
  question: string
  answer: CopilotAnswer
  /** how many tool calls have finished */
  toolsDone: number
  phase: "thinking" | "tools" | "answering" | "done"
}

export function CopilotChat({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const { t, locale } = useLocale()
  const tenant = useTenant()
  const [turns, setTurns] = React.useState<Turn[]>([])
  const [input, setInput] = React.useState("")
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [turns])

  const ask = React.useCallback((question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    const answer = routeAnswer(trimmed)
    const id = `turn_${Date.now()}`
    setInput("")
    setTurns((prev) => [
      ...prev,
      { id, question: trimmed, answer, toolsDone: 0, phase: "thinking" },
    ])

    const update = (patch: Partial<Turn>) =>
      setTurns((prev) =>
        prev.map((turn) => (turn.id === id ? { ...turn, ...patch } : turn))
      )

    // Thinking → tool calls resolving one by one → streamed answer.
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => update({ phase: "tools" }), 620))

    let offset = 620
    answer.tools.forEach((tool, index) => {
      offset += tool.latencyMs
      timers.push(setTimeout(() => update({ toolsDone: index + 1 }), offset))
    })
    timers.push(setTimeout(() => update({ phase: "answering" }), offset + 180))
  }, [])

  return (
    <div
      data-slot="copilot-chat"
      className={cn("flex min-h-0 flex-1 flex-col", className)}
    >
      <ScrollFade className="min-h-0 flex-1 px-4 py-4" fade={20}>
        {turns.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary"
            >
              <Sparkles className="size-5" />
            </motion.div>
            <div>
              <p className="text-sm font-medium">{t("ai.copilot")}</p>
              <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                {t("ai.copilotSubtitle")} · {tenant.name[locale]}
              </p>
            </div>
            <div
              className={cn(
                "grid w-full gap-1.5",
                compact ? "grid-cols-1" : "max-w-[540px] grid-cols-2"
              )}
            >
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => ask(prompt[locale])}
                  className="rounded-lg bg-card px-3 py-2 text-left text-[0.6875rem] ring-1 ring-foreground/[0.08] transition-colors hover:bg-muted"
                >
                  {prompt[locale]}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
            {turns.map((turn) => (
              <TurnBlock
                key={turn.id}
                turn={turn}
                onAsk={ask}
                compact={compact}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollFade>

      <div className="border-t border-[var(--hairline)] p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            ask(input)
          }}
          className="mx-auto flex w-full max-w-[640px] items-end gap-2 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 focus-within:ring-primary/40"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                ask(input)
              }
            }}
            rows={1}
            placeholder={t("ai.askPlaceholder")}
            className="max-h-24 min-h-7 flex-1 resize-none bg-transparent px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <ArrowUp />
          </Button>
        </form>
        {turns.length > 0 ? (
          <div className="mx-auto mt-1.5 flex w-full max-w-[640px] justify-end">
            <button
              onClick={() => setTurns([])}
              className="flex items-center gap-1 text-[0.625rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-2.5" />
              {t("ai.newChat")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TurnBlock({
  turn,
  onAsk,
  compact,
}: {
  turn: Turn
  onAsk: (question: string) => void
  compact: boolean
}) {
  const { t, locale } = useLocale()
  const [answered, setAnswered] = React.useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-end gap-2">
        <div className="max-w-[80%] rounded-xl rounded-tr-sm bg-primary px-3 py-2 text-xs text-primary-foreground">
          {turn.question}
        </div>
        <Avatar name="Adib Mohsin" seed="adib" size={22} className="mt-0.5" />
      </div>

      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Bot className="size-3" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <AnimatePresence mode="wait">
            {turn.phase === "thinking" ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground"
              >
                <ThinkingDots />
                {turn.answer.thinking[locale]}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {turn.phase !== "thinking"
            ? turn.answer.tools.map((tool, index) => (
                <ToolCallCard
                  key={tool.id}
                  tool={tool}
                  running={index >= turn.toolsDone}
                />
              ))
            : null}

          {turn.phase === "answering" || turn.phase === "done" ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs leading-relaxed"
            >
              <StreamingText
                text={turn.answer.answer[locale]}
                onDone={() => setAnswered(true)}
              />
            </motion.div>
          ) : null}

          <AnimatePresence>
            {answered ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 pt-1"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                    <BookOpen className="size-2.5" />
                    {t("ai.sources")}
                  </span>
                  {turn.answer.sources.map((source, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-muted px-2 py-0.5 text-[0.625rem] text-muted-foreground"
                    >
                      {source[locale]}
                    </span>
                  ))}
                </div>
                <div
                  className={cn(
                    "flex gap-1.5",
                    compact ? "flex-col items-start" : "flex-wrap"
                  )}
                >
                  {turn.answer.followUps.map((followUp, index) => (
                    <button
                      key={index}
                      onClick={() => onAsk(followUp[locale])}
                      className="rounded-full border border-border px-2.5 py-1 text-[0.625rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {followUp[locale]}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
