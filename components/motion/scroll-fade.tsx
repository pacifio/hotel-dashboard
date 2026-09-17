"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * sidebar.mp4 — a scroll region whose top and bottom edges dissolve, but only
 * on the side there is actually more content. The fade animates in rather than
 * snapping, which is the whole trick.
 */
export function ScrollFade({
  className,
  fade = 28,
  children,
  ...props
}: React.ComponentProps<"div"> & { fade?: number }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [edges, setEdges] = React.useState({ top: 0, bottom: 0 })

  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    if (max <= 2) {
      setEdges({ top: 0, bottom: 0 })
      return
    }
    setEdges({
      top: Math.min(1, el.scrollTop / fade) * fade,
      bottom: Math.min(1, (max - el.scrollTop) / fade) * fade,
    })
  }, [fade])

  React.useEffect(() => {
    measure()
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [measure])

  return (
    <div
      ref={ref}
      data-slot="scroll-fade"
      onScroll={measure}
      className={cn("scroll-fade overflow-y-auto", className)}
      style={
        {
          "--fade-top": `${edges.top}px`,
          "--fade-bottom": `${edges.bottom}px`,
          transition: "--fade-top 150ms linear, --fade-bottom 150ms linear",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}
