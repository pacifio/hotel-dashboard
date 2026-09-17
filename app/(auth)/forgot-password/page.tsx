"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ArrowLeft, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"

export default function ForgotPasswordPage() {
  const { t } = useLocale()
  const router = useRouter()

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(event) => {
        event.preventDefault()
        router.push("/verify-otp")
      }}
      className="w-full max-w-[340px]"
    >
      <Link
        href="/login"
        className="mb-4 inline-flex items-center gap-1 text-[0.6875rem] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        {t("auth.signIn")}
      </Link>
      <h1 className="text-xl font-medium tracking-tight">
        {t("auth.forgotTitle")}
      </h1>
      <p className="mt-1 text-[0.6875rem] text-muted-foreground">
        {t("auth.forgotSubtitle")}
      </p>
      <label className="mt-5 grid gap-1">
        <span className="micro">{t("auth.emailLabel")}</span>
        <input
          type="email"
          defaultValue="adib@auberge.app"
          className="h-8 rounded-md border border-border bg-card px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </label>
      <Button type="submit" size="lg" className="mt-4 w-full justify-center">
        <Send />
        {t("auth.sendCode")}
      </Button>
    </motion.form>
  )
}
