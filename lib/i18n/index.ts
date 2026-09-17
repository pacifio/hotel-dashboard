export * from "./config"
export * from "./format"
export { en, type Dictionary } from "./en"
export { bn } from "./bn"

import { en } from "./en"
import { bn } from "./bn"
import type { Locale } from "./config"
import type { Dictionary } from "./en"

export const dictionaries: Record<Locale, Dictionary> = { en, bn }

/**
 * Dot-paths into the dictionary, e.g. "nav.frontDesk" or "ai.pipeline.query".
 * Typed so a renamed or missing key fails at build time rather than rendering
 * a raw key string in the demo.
 */
export type TranslationKey = Paths<typeof en>

type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`
}[keyof T & string]

export function lookup(dict: Dictionary, key: string): string {
  let node: unknown = dict
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return key
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === "string" ? node : key
}

export function interpolate(
  template: string,
  params?: Record<string, string | number>
) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}
