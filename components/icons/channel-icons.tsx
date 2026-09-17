"use client"

import * as React from "react"
import { Globe, Mail, MessageSquare, Phone } from "lucide-react"

import type { ChannelId, TagHue } from "@/lib/types"

type IconProps = React.SVGProps<SVGSVGElement>

/** lucide dropped brand marks, so the messaging channels get inline glyphs. */
function WhatsApp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96A9.9 9.9 0 0 0 19.1 4.9 9.9 9.9 0 0 0 12.04 2m0 1.67a8.26 8.26 0 0 1 8.28 8.29 8.28 8.28 0 0 1-12.5 7.11l-.37-.22-3.09.81.82-3.01-.24-.38a8.24 8.24 0 0 1-1.27-4.4 8.28 8.28 0 0 1 8.37-8.2m-3.6 4.2c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.6c.13.18 1.76 2.8 4.3 3.81 2.1.83 2.53.67 2.99.62.46-.04 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29-.25-.12-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.12-.17.25-.65.81-.79.98-.15.16-.29.19-.54.06-.25-.12-1.06-.39-2.01-1.24-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.55-1.35-.77-1.85-.2-.48-.41-.41-.56-.42z" />
    </svg>
  )
}

function Messenger(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.24 2 2 6.22 2 11.92c0 2.98 1.23 5.56 3.23 7.34.17.15.27.36.27.59l.06 1.82c.02.58.62.96 1.15.73l2.03-.9a.8.8 0 0 1 .53-.04c.87.24 1.8.37 2.73.37 5.76 0 10-4.22 10-9.92S17.76 2 12 2m6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63" />
    </svg>
  )
}

function Instagram(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const CHANNEL_ICON: Record<ChannelId, React.ComponentType<IconProps>> = {
  whatsapp: WhatsApp,
  messenger: Messenger,
  instagram: Instagram,
  sms: MessageSquare,
  email: Mail,
  voice: Phone,
  webchat: Globe,
}

export const CHANNEL_HUE: Record<ChannelId, TagHue> = {
  whatsapp: "green",
  messenger: "blue",
  instagram: "magenta",
  sms: "amber",
  email: "slate",
  voice: "purple",
  webchat: "teal",
}

export function ChannelIcon({
  channel,
  className,
}: {
  channel: ChannelId
  className?: string
}) {
  const Icon = CHANNEL_ICON[channel]
  return <Icon className={className} />
}

export function ChannelBadge({
  channel,
  size = 22,
}: {
  channel: ChannelId
  size?: number
}) {
  const hue = CHANNEL_HUE[channel]
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md"
      style={{
        width: size,
        height: size,
        background: `color-mix(in oklch, var(--hue-${hue}) 14%, transparent)`,
        color: `var(--hue-${hue})`,
      }}
    >
      <ChannelIcon channel={channel} className="size-[55%]" />
    </span>
  )
}
