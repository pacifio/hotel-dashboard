"use client"

import * as React from "react"
import NumberFlow, { continuous, type Format } from "@number-flow/react"
import { motion } from "motion/react"

import { useLocale } from "@/lib/i18n/provider"
import { intlLocale } from "@/lib/i18n/format"
import { cn } from "@/lib/utils"

/**
 * Digit-by-digit animated figures.
 *
 * NumberFlow can only tween Latin digit glyphs, so under the Bengali numbering
 * system it renders separators with no digits between them. Bangla therefore
 * gets a keyed slide-and-fade on the fully formatted string instead — still
 * animated on change, just not per-digit.
 */
export function NumberTicker({
  value,
  format,
  prefix,
  suffix,
  className,
}: {
  value: number
  format?: Format
  prefix?: string
  suffix?: string
  className?: string
}) {
  const { locale } = useLocale()
  const options: Format = { maximumFractionDigits: 0, ...format }

  if (locale === "bn") {
    const text = `${prefix ?? ""}${new Intl.NumberFormat(
      intlLocale(locale),
      options as Intl.NumberFormatOptions
    ).format(value)}${suffix ?? ""}`

    // No overflow mask here: Bengali line boxes are taller than the declared
    // line-height, so clipping the wrapper shaves the glyph descenders.
    return (
      <span
        data-slot="number-ticker"
        className={cn("nums inline-block align-bottom", className)}
      >
        <motion.span
          key={text}
          initial={{ y: "0.22em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </span>
    )
  }

  return (
    <NumberFlow
      data-slot="number-ticker"
      value={value}
      locales={intlLocale(locale)}
      format={options}
      prefix={prefix}
      suffix={suffix}
      plugins={[continuous]}
      transformTiming={{ duration: 650, easing: "cubic-bezier(0.22,1,0.36,1)" }}
      spinTiming={{ duration: 750, easing: "cubic-bezier(0.22,1,0.36,1)" }}
      className={cn("nums", className)}
    />
  )
}
