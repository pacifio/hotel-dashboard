"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Circle, Maximize2, Move, Users, VideoOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"
import { useMounted } from "@/hooks/use-mounted"
import type { Camera } from "@/lib/types"

/**
 * A synthetic camera frame. Nothing is streamed — the "picture" is a
 * deterministic arrangement of gradients and silhouettes derived from the
 * camera's seed, overlaid with the chrome an operator actually reads: code,
 * timestamp, record state and analytics counts.
 */
export function CameraTile({
  camera,
  dense = false,
  active = false,
  onExpand,
  onSelect,
  className,
}: {
  camera: Camera
  dense?: boolean
  active?: boolean
  onExpand?: () => void
  onSelect?: () => void
  className?: string
}) {
  const { t, num, locale } = useLocale()
  const offline = camera.status === "offline"

  return (
    <motion.button
      layout
      onClick={onSelect}
      data-slot="camera-tile"
      className={cn(
        "group/tile relative overflow-hidden rounded-lg bg-[oklch(0.16_0_0)] text-left ring-1 transition-shadow",
        active
          ? "ring-2 ring-primary"
          : "ring-foreground/10 hover:ring-primary/40",
        className
      )}
    >
      <div className="relative aspect-video w-full">
        {offline ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-[oklch(0.55_0_0)]">
            <VideoOff className="size-5" />
            <span className="text-[0.625rem]">{t("vms.cctv.noSignal")}</span>
          </div>
        ) : (
          <SyntheticFrame camera={camera} />
        )}

        {/* Operator chrome */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-1.5">
          <div className="flex items-start justify-between gap-1">
            <span className="nums rounded bg-black/55 px-1.5 py-0.5 text-[0.5625rem] font-medium text-white/90 backdrop-blur-sm">
              {camera.code}
            </span>
            {camera.recording ? (
              <span className="flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 backdrop-blur-sm">
                <Circle className="size-1.5 animate-pulse fill-[oklch(0.62_0.22_25)] text-[oklch(0.62_0.22_25)]" />
                <span className="text-[0.5625rem] font-medium text-white/90">
                  {t("vms.cctv.recording")}
                </span>
              </span>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-1">
            <span className="min-w-0 rounded bg-black/55 px-1.5 py-0.5 text-[0.5625rem] text-white/90 backdrop-blur-sm">
              <span className="block truncate">{camera.name[locale]}</span>
            </span>
            {!offline && !dense ? (
              <span className="nums flex shrink-0 items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[0.5625rem] text-white/90 backdrop-blur-sm">
                <Users className="size-2" />
                {num(camera.peopleCount)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Timestamp reads as a live feed, so it only renders after mount. */}
        <FrameClock offline={offline} />

        {camera.status === "degraded" ? (
          <span className="pointer-events-none absolute inset-0 bg-[oklch(0.8_0.15_78)]/[0.06]" />
        ) : null}

        {onExpand ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation()
              onExpand()
            }}
            className="absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/tile:opacity-100"
          >
            <Maximize2 className="size-3.5" />
          </span>
        ) : null}
      </div>

      {dense ? null : (
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              camera.status === "live" && "bg-[var(--success)]",
              camera.status === "degraded" && "bg-[var(--warning)]",
              offline && "bg-[var(--destructive)]"
            )}
          />
          <span className="truncate text-[0.625rem] text-muted-foreground">
            {camera.zone[locale]}
          </span>
          {camera.ptz ? (
            <Move className="size-2.5 shrink-0 text-muted-foreground" />
          ) : null}
          <span className="nums ml-auto shrink-0 text-[0.5625rem] text-muted-foreground">
            {camera.resolution}
          </span>
        </div>
      )}
    </motion.button>
  )
}

/**
 * Deterministic pseudo-scene: a floor plane, a light pool and a few drifting
 * silhouettes, all positioned from the camera seed so a given camera always
 * renders the same picture.
 */
const round = (value: number) => Math.round(value * 100) / 100

function SyntheticFrame({ camera }: { camera: Camera }) {
  const seed = camera.frameSeed
  const people = camera.peopleCount
  const rand = React.useCallback(
    // Rounded so the server-rendered style string and the client's agree —
    // React truncates inline-style floats to 6 significant figures.
    (n: number) => Math.round(((Math.sin(seed * n) + 1) / 2) * 1e4) / 1e4,
    [seed]
  )

  const figures = React.useMemo(
    () =>
      Array.from({ length: Math.min(4, Math.ceil(people / 3)) }).map(
        (_, i) => ({
          left: 12 + rand(i + 2) * 70,
          scale: 0.6 + rand(i + 7) * 0.5,
          delay: rand(i + 11) * 3,
          duration: 7 + rand(i + 13) * 6,
        })
      ),
    [rand, people]
  )

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Room: back wall, floor plane, and a pool of light from a fixture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.2 0.01 ${round(
            200 + rand(1) * 80
          )}) 0%, oklch(0.14 0.008 250) 58%, oklch(0.1 0.005 250) 100%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, oklch(0.24 0.006 250) 0%, oklch(0.16 0.004 250) 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          left: `${round(18 + rand(3) * 50)}%`,
          top: "-14%",
          width: "44%",
          height: "82%",
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, oklch(0.62 0.02 90 / 0.24), transparent 68%)",
        }}
      />

      {/* Drifting silhouettes stand in for people in frame */}
      {figures.map((figure, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ x: -8, opacity: 0.55 }}
          animate={{ x: 14, opacity: 0.75 }}
          transition={{
            duration: figure.duration,
            delay: figure.delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute bottom-[14%] rounded-t-full bg-[oklch(0.07_0_0)]/70"
          style={{
            left: `${figure.left}%`,
            width: `${round(5 * figure.scale)}%`,
            height: `${round(34 * figure.scale)}%`,
          }}
        />
      ))}

      {/* Sensor grain and a slow rolling scanline */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <motion.div
        aria-hidden
        animate={{ y: ["-12%", "112%"] }}
        transition={{
          duration: camera.status === "degraded" ? 3.2 : 6.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-x-0 h-[18%] bg-gradient-to-b from-transparent via-white/[0.06] to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.42) 100%)",
        }}
      />
    </div>
  )
}

/** Live-looking wall clock. Client-only so the server never renders a time. */
function FrameClock({ offline }: { offline: boolean }) {
  const mounted = useMounted()
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    if (offline) return
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [offline])

  if (!mounted || offline || !now) return null

  const stamp = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":")

  return (
    <span className="pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[0.5625rem] text-white/85 tabular-nums backdrop-blur-sm">
      {stamp}
    </span>
  )
}
