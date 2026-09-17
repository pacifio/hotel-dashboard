"use client"

import * as React from "react"

/**
 * Anything that reads from localStorage (theme, locale) only knows its real
 * value after mount. Gate those renders instead of letting the server and
 * client disagree.
 */
export function useMounted() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted
}
