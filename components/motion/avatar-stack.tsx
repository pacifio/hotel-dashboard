"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { hueFor } from "@/lib/hue"

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

/** calendar.jpg — overlapping avatars with a +N overflow chip. */
export function AvatarStack({
  people,
  max = 4,
  size = 20,
  className,
}: {
  people: { id: string; name: string }[]
  max?: number
  size?: number
  className?: string
}) {
  const shown = people.slice(0, max)
  const overflow = people.length - shown.length

  return (
    <div
      data-slot="avatar-stack"
      className={cn("flex items-center", className)}
    >
      {shown.map((person, index) => (
        <span
          key={person.id}
          title={person.name}
          style={{
            width: size,
            height: size,
            marginLeft: index === 0 ? 0 : -size * 0.3,
            zIndex: shown.length - index,
            background: `color-mix(in oklch, var(--hue-${hueFor(person.id)}) 22%, var(--card))`,
            color: `var(--hue-${hueFor(person.id)})`,
            fontSize: size * 0.4,
          }}
          className="inline-flex items-center justify-center rounded-full font-medium ring-2 ring-card"
        >
          {initials(person.name)}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.3,
            fontSize: size * 0.38,
          }}
          className="nums inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-card"
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}

export function Avatar({
  name,
  seed,
  size = 28,
  className,
}: {
  name: string
  seed?: string
  size?: number
  className?: string
}) {
  const hue = hueFor(seed ?? name)
  return (
    <span
      data-slot="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `color-mix(in oklch, var(--hue-${hue}) 20%, var(--card))`,
        color: `color-mix(in oklch, var(--hue-${hue}) 88%, var(--foreground))`,
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        className
      )}
    >
      {initials(name)}
    </span>
  )
}
