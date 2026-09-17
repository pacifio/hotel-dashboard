"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/i18n/provider"

const FIELDS = [
  { id: "hotel", labelKey: "settings.propertyName", value: "Sarina Residency" },
  { id: "name", labelKey: "common.name", value: "Adib Mohsin" },
  { id: "email", labelKey: "auth.emailLabel", value: "adib@auberge.app" },
  {
    id: "password",
    labelKey: "auth.passwordLabel",
    value: "demo-password",
    type: "password",
  },
] as const

export default function SignupPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(event) => {
        event.preventDefault()
        setBusy(true)
        setTimeout(() => router.push("/verify-otp"), 700)
      }}
      className="w-full max-w-[340px]"
    >
      <h1 className="text-xl font-medium tracking-tight">
        {t("auth.signUpTitle")}
      </h1>
      <p className="mt-1 text-[0.6875rem] text-muted-foreground">
        {t("auth.signUpSubtitle")}
      </p>

      <div className="mt-5 grid gap-2.5">
        {FIELDS.map((field) => (
          <label key={field.id} className="grid gap-1">
            <span className="micro">{t(field.labelKey)}</span>
            <input
              type={"type" in field ? field.type : "text"}
              defaultValue={field.value}
              className="h-8 rounded-md border border-border bg-card px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </label>
        ))}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={busy}
        className="mt-4 w-full justify-center"
      >
        {busy ? <Loader2 className="animate-spin" /> : null}
        {t("auth.signUp")}
        {busy ? null : <ArrowRight />}
      </Button>

      <p className="mt-4 text-center text-[0.6875rem] text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </motion.form>
  )
}
