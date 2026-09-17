"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ExternalLink, Globe, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { useMounted } from "@/hooks/use-mounted"

import { useLocale } from "@/lib/i18n/provider"
import { LOCALE_META } from "@/lib/i18n/config"
import { useDataset, useMoney, useTenant } from "@/lib/data"
import { CombChart } from "@/components/motion/comb-chart"
import { NumberTicker } from "@/components/motion/number-ticker"
import { CHART_COLORS, HUE_VAR } from "@/lib/hue"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t, locale, setLocale, num } = useLocale()
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()
  const tenant = useTenant()
  const data = useDataset()
  const money = useMoney()

  const stats = [
    {
      id: "occupancy",
      label: t("dashboard.occupancy"),
      value: data.kpis[0].value,
      suffix: "%",
      spark: data.kpis[0].spark,
    },
    {
      id: "adr",
      label: t("dashboard.adr"),
      value: data.kpis[1].value,
      prefix: money.symbol,
      spark: data.kpis[1].spark,
    },
  ]

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-5">
          <span
            className="flex size-6 items-center justify-center rounded-md text-[0.625rem] font-semibold"
            style={{
              background: `color-mix(in oklch, ${HUE_VAR[tenant.hue]} 16%, transparent)`,
              color: HUE_VAR[tenant.hue],
            }}
          >
            {tenant.initials}
          </span>
          <span className="text-xs font-medium">{t("brand.name")}</span>
          <span className="hidden text-[0.625rem] text-muted-foreground sm:inline">
            {t("brand.ownedBy")}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setLocale(locale === "en" ? "bn" : "en")}
              className="flex h-6 items-center gap-1 rounded-md px-2 text-[0.625rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Globe className="size-3" />
              {LOCALE_META[locale === "en" ? "bn" : "en"].nativeLabel}
            </button>
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="size-3.5" />
              ) : (
                <Moon className="size-3.5" />
              )}
            </button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 pb-12">
          {children}
        </div>
      </div>

      {/* Right panel — the property itself, rendered live from its own data */}
      <aside className="relative hidden w-[46%] max-w-[620px] shrink-0 overflow-hidden border-l border-[var(--hairline)] bg-surface lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background: `radial-gradient(1000px 520px at 78% -8%, color-mix(in oklch, ${HUE_VAR[tenant.hue]} 22%, transparent), transparent 62%)`,
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="micro">{tenant.country[locale]}</div>
            <h2 className="mt-2 text-3xl font-medium tracking-tight">
              {tenant.name[locale]}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {tenant.city[locale]} · {num(tenant.roomCount)}{" "}
              {t("common.rooms").toLowerCase()} · {num(tenant.stars)}★
            </p>
          </motion.div>

          <div className="grid gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1, duration: 0.4 }}
                className="rounded-xl bg-card/70 p-4 ring-1 ring-foreground/[0.07] backdrop-blur-xl"
              >
                <div className="micro">{stat.label}</div>
                <div className="figure mt-1 text-3xl">
                  <NumberTicker
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <CombChart
                  values={stat.spark}
                  color={CHART_COLORS[index]}
                  height={28}
                  className="mt-3"
                />
              </motion.div>
            ))}
            <div className="flex flex-col gap-1.5">
              <p className="text-[0.625rem] text-muted-foreground">
                {t("auth.demoNotice")}
              </p>
              <a
                href="https://uvtrinfotech.com/"
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-1 text-[0.625rem] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("brand.ownedBy")}
                <ExternalLink className="size-2.5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
