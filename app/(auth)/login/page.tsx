"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"

export default function LoginPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [email, setEmail] = React.useState("adib@auberge.app")
  const [password, setPassword] = React.useState("demo-password")
  const [show, setShow] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setTimeout(() => router.push("/select-property"), 700)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[340px]"
    >
      <h1 className="text-xl font-medium tracking-tight">
        {t("auth.signInTitle")}
      </h1>
      <p className="mt-1 text-[0.6875rem] text-muted-foreground">
        {t("auth.signInSubtitle")}
      </p>

      <div className="mt-5 grid gap-1.5">
        {["Google", "Microsoft", "SSO"].map((provider) => (
          <Button
            key={provider}
            variant="outline"
            size="lg"
            className="justify-center"
          >
            {t("auth.continueWith", { provider })}
          </Button>
        ))}
      </div>

      <div className="my-4 flex items-center gap-2">
        <span className="h-px flex-1 bg-[var(--hairline)]" />
        <span className="text-[0.625rem] text-muted-foreground">
          {t("auth.orContinueWith")}
        </span>
        <span className="h-px flex-1 bg-[var(--hairline)]" />
      </div>

      <form onSubmit={submit} className="grid gap-2.5">
        <label className="grid gap-1">
          <span className="micro">{t("auth.emailLabel")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-8 rounded-md border border-border bg-card px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </label>

        <label className="grid gap-1">
          <span className="micro flex items-center justify-between">
            {t("auth.passwordLabel")}
            <Link
              href="/forgot-password"
              className="text-[0.625rem] font-normal tracking-normal text-muted-foreground normal-case transition-colors hover:text-foreground"
            >
              {t("auth.forgotPassword")}
            </Link>
          </span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-8 w-full rounded-md border border-border bg-card px-2.5 pr-8 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
        </label>

        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className="mt-1 justify-center"
        >
          {busy ? <Loader2 className="animate-spin" /> : null}
          {t("auth.signIn")}
          {busy ? null : <ArrowRight />}
        </Button>
      </form>

      <p className="mt-4 text-center text-[0.6875rem] text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="text-primary hover:underline">
          {t("auth.signUp")}
        </Link>
      </p>
      <p className="mt-4 text-center text-[0.625rem] leading-relaxed text-muted-foreground/70">
        {t("auth.terms")}
      </p>
    </motion.div>
  )
}
