"use client"

import * as React from "react"

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./config"
import { dictionaries, interpolate, lookup, type TranslationKey } from "./index"
import {
  formatCompact,
  formatDate,
  formatDateTime,
  formatDecimal,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelative,
  formatTime,
  localizeDigits,
} from "./format"

type TranslateParams = Record<string, string | number>

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  isBangla: boolean
  t: (key: TranslationKey, params?: TranslateParams) => string
  /** Untyped escape hatch for keys assembled at runtime (e.g. `crm.stages.${id}`) */
  tk: (key: string, params?: TranslateParams) => string
  num: (value: number, options?: Intl.NumberFormatOptions) => string
  dec: (value: number, digits?: number) => string
  pct: (value: number, digits?: number) => string
  compact: (value: number) => string
  date: (
    value: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => string
  time: (value: Date | string | number) => string
  dateTime: (value: Date | string | number) => string
  relative: (value: Date | string | number) => string
  duration: (seconds: number) => string
  digits: (value: string) => string
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value)
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE)

  // Read the persisted choice after mount so the server and the first client
  // render agree on the default.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) setLocaleState(stored)
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Persisting on explicit change rather than in an effect keeps StrictMode's
  // double-mount from writing the default back over the stored value.
  const setLocale = React.useCallback((next: Locale) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
    setLocaleState(next)
  }, [])

  const value = React.useMemo<LocaleContextValue>(() => {
    const dict = dictionaries[locale]
    const tk = (key: string, params?: TranslateParams) =>
      interpolate(lookup(dict, key), params)

    return {
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "en" ? "bn" : "en"),
      isBangla: locale === "bn",
      t: tk as LocaleContextValue["t"],
      tk,
      num: (v, options) => formatNumber(v, locale, options),
      dec: (v, digits) => formatDecimal(v, locale, digits),
      pct: (v, digits) => formatPercent(v, locale, digits),
      compact: (v) => formatCompact(v, locale),
      date: (v, options) => formatDate(v, locale, options),
      time: (v) => formatTime(v, locale),
      dateTime: (v) => formatDateTime(v, locale),
      relative: (v) => formatRelative(v, locale),
      duration: (s) => formatDuration(s, locale),
      digits: (v) => localizeDigits(v, locale),
    }
  }, [locale, setLocale])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = React.useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used inside <LocaleProvider>")
  }
  return context
}

/** Convenience for the common case: `const t = useT()` */
export function useT() {
  return useLocale().t
}
