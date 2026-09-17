"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Check, Globe } from "lucide-react"

import { Panel, PageHeader } from "@/components/motion/card-shell"
import { NumberTicker } from "@/components/motion/number-ticker"
import { cn } from "@/lib/utils"
import { useMoney, useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { LOCALES, LOCALE_META } from "@/lib/i18n/config"
import { demoToday } from "@/lib/demo-time"

export default function LocalizationPage() {
  const { t, locale, setLocale, num, date, dateTime } = useLocale()
  const money = useMoney()
  const tenant = useTenant()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("settings.localization")}
        subtitle={`${LOCALE_META[locale].nativeLabel} · ${tenant.currency}`}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="grid max-w-[880px] gap-3 lg:grid-cols-2">
          <Panel title={t("settings.interfaceLanguage")}>
            <div className="grid gap-2 pt-1">
              {LOCALES.map((code) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg bg-surface p-3 text-left ring-1 transition-all",
                    code === locale
                      ? "ring-2 ring-primary"
                      : "ring-foreground/[0.06] hover:bg-muted"
                  )}
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-[0.6875rem] font-semibold">
                    {LOCALE_META[code].short}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">
                      {LOCALE_META[code].nativeLabel}
                    </span>
                    <span className="block truncate text-[0.625rem] text-muted-foreground">
                      {LOCALE_META[code].label} · {LOCALE_META[code].region}
                    </span>
                  </span>
                  {code === locale ? (
                    <Check className="size-3.5 shrink-0 text-primary" />
                  ) : null}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title={t("settings.numeralSystem")} delay={0.05}>
            <div className="flex flex-col gap-2 pt-1">
              <Preview
                label={t("settings.numberFormat")}
                value={<NumberTicker value={1234567} />}
              />
              <Preview
                label={t("settings.currency")}
                value={money.format(1234567)}
              />
              <Preview
                label={t("common.total")}
                value={money.compact(1234567)}
              />
              <Preview
                label={t("settings.dateFormat")}
                value={date(demoToday(), {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <Preview label={t("common.time")} value={dateTime(demoToday())} />
              <Preview
                label={t("dashboard.occupancy")}
                value={`${num(76.4, { minimumFractionDigits: 1 })}%`}
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Globe className="size-3 text-muted-foreground" />
              <span className="text-[0.625rem] text-muted-foreground">
                {locale === "bn"
                  ? "বাংলায় সংখ্যা, তারিখ ও মুদ্রা স্বয়ংক্রিয়ভাবে বাংলা রীতিতে দেখানো হয়।"
                  : "Numerals, dates and currency follow the selected locale automatically."}
              </span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Preview({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
      <span className="micro">{label}</span>
      <motion.span
        key={String(value)}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="nums text-[0.6875rem] font-medium"
      >
        {value}
      </motion.span>
    </div>
  )
}
