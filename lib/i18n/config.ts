export const LOCALES = ["en", "bn"] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_META: Record<
  Locale,
  { label: string; nativeLabel: string; short: string; region: string }
> = {
  en: {
    label: "English",
    nativeLabel: "English",
    short: "EN",
    region: "United States",
  },
  bn: {
    label: "Bangla",
    nativeLabel: "বাংলা",
    short: "বাং",
    region: "বাংলাদেশ",
  },
}

export const DEFAULT_LOCALE: Locale = "bn"
export const LOCALE_STORAGE_KEY = "auberge.locale"
