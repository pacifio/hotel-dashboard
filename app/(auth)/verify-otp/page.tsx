"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

export default function VerifyOtpPage() {
  const { t, num } = useLocale()
  const router = useRouter()
  const [digits, setDigits] = React.useState(["", "", "", "", "", ""])
  const [seconds, setSeconds] = React.useState(32)
  const [busy, setBusy] = React.useState(false)
  const refs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  const complete = digits.every((digit) => digit !== "")

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = clean
      return next
    })
    if (clean && index < 5) refs.current[index + 1]?.focus()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[340px]"
    >
      <h1 className="text-xl font-medium tracking-tight">
        {t("auth.otpTitle")}
      </h1>
      <p className="mt-1 text-[0.6875rem] text-muted-foreground">
        {t("auth.otpSubtitle", { email: "adib@auberge.app" })}
      </p>

      <div className="mt-5 flex gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element
            }}
            value={digit}
            inputMode="numeric"
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digits[index] && index > 0) {
                refs.current[index - 1]?.focus()
              }
            }}
            className={cn(
              "nums h-11 flex-1 rounded-lg border bg-card text-center text-base transition-all outline-none",
              digit ? "border-primary" : "border-border",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            )}
          />
        ))}
      </div>

      <Button
        size="lg"
        disabled={!complete || busy}
        onClick={() => {
          setBusy(true)
          setTimeout(() => router.push("/select-property"), 700)
        }}
        className="mt-4 w-full justify-center"
      >
        {busy ? <Loader2 className="animate-spin" /> : <Check />}
        {t("auth.verify")}
      </Button>

      <button
        disabled={seconds > 0}
        onClick={() => setSeconds(32)}
        className="mt-3 w-full text-center text-[0.6875rem] text-muted-foreground transition-colors hover:text-foreground disabled:hover:text-muted-foreground"
      >
        {seconds > 0
          ? t("auth.resendIn", { seconds: num(seconds) })
          : t("auth.resendCode")}
      </button>
    </motion.div>
  )
}
