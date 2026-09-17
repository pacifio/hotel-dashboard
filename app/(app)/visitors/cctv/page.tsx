"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  Move,
  Square,
  Video,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CameraTile } from "@/components/vms/camera-tile"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { Camera, CameraStatus, TagHue } from "@/lib/types"

const LAYOUTS = [
  { id: "1", cols: 1, icon: Square },
  { id: "4", cols: 2, icon: Grid2x2 },
  { id: "9", cols: 3, icon: Grid3x3 },
  { id: "16", cols: 4, icon: LayoutGrid },
] as const

type LayoutId = (typeof LAYOUTS)[number]["id"]

const STATUS_HUE: Record<CameraStatus, TagHue> = {
  live: "green",
  degraded: "amber",
  offline: "rose",
}

export default function CctvPage() {
  const data = useDataset()
  const { t, locale, num, relative } = useLocale()

  const [layout, setLayout] = React.useState<LayoutId>("9")
  const [zone, setZone] = React.useState<string>("all")
  const [selectedId, setSelectedId] = React.useState(data.cameras[0]?.id)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setSelectedId(data.cameras[0]?.id)
    setExpandedId(null)
  }, [data.cameras])

  const zones = React.useMemo(() => {
    const seen = new Map<string, string>()
    for (const camera of data.cameras) seen.set(camera.zone.en, camera.zone[locale])
    return [...seen.entries()]
  }, [data.cameras, locale])

  const cameras = React.useMemo(
    () =>
      zone === "all"
        ? data.cameras
        : data.cameras.filter((camera) => camera.zone.en === zone),
    [data.cameras, zone]
  )

  const wall = React.useMemo(() => {
    const tiles = Number(layout)
    return cameras.slice(0, tiles)
  }, [cameras, layout])

  const cols = LAYOUTS.find((option) => option.id === layout)?.cols ?? 3
  const expanded = expandedId
    ? data.cameras.find((camera) => camera.id === expandedId)
    : undefined

  const kpis = React.useMemo(() => {
    const count = (status: CameraStatus) =>
      data.cameras.filter((camera) => camera.status === status).length
    return [
      {
        id: "total",
        label: t("vms.cctv.cameras"),
        value: data.cameras.length,
        color: CHART_COLORS[0],
      },
      { id: "live", label: t("vms.cctv.live"), value: count("live"), color: CHART_COLORS[5] },
      {
        id: "degraded",
        label: t("vms.cctv.degraded"),
        value: count("degraded"),
        color: CHART_COLORS[3],
      },
      {
        id: "offline",
        label: t("vms.cctv.offline"),
        value: count("offline"),
        color: CHART_COLORS[4],
      },
    ]
  }, [data.cameras, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("vms.cctv.wall")} subtitle={t("vms.title")}>
        <SegmentedPills
          size="sm"
          value={layout}
          onChange={setLayout}
          options={LAYOUTS.map((option) => ({
            value: option.id,
            label: num(Number(option.id)),
            icon: <option.icon className="size-3" />,
          }))}
        />
      </PageHeader>

      <div className="flex min-h-0 flex-1 gap-3 px-5 pb-5">
        {/* Camera list */}
        <aside className="flex w-[13.5rem] shrink-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3">
            <Video className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">{t("vms.cctv.cameras")}</span>
            <span className="nums ml-auto rounded-full bg-muted px-1.5 text-[0.625rem] text-muted-foreground">
              {num(cameras.length)}
            </span>
          </div>

          <div className="border-b border-[var(--hairline)] p-2">
            <select
              value={zone}
              onChange={(event) => setZone(event.target.value)}
              className="h-7 w-full rounded-md border border-border bg-surface px-2 text-[0.6875rem] outline-none focus-visible:border-ring"
            >
              <option value="all">{t("vms.cctv.allZones")}</option>
              {zones.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <ScrollFade className="min-h-0 flex-1 p-1.5">
            {cameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => setSelectedId(camera.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                  camera.id === selectedId
                    ? "bg-sidebar-accent"
                    : "hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    camera.status === "live" && "bg-[var(--success)]",
                    camera.status === "degraded" && "bg-[var(--warning)]",
                    camera.status === "offline" && "bg-[var(--destructive)]"
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.6875rem]">
                    {camera.name[locale]}
                  </span>
                  <span className="nums block truncate text-[0.5625rem] text-muted-foreground">
                    {camera.code} · {camera.resolution}
                  </span>
                </span>
                {camera.ptz ? (
                  <Move className="size-2.5 shrink-0 text-muted-foreground" />
                ) : null}
              </button>
            ))}
          </ScrollFade>
        </aside>

        {/* Wall */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <KpiStrip cells={kpis} />

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-card p-2.5 ring-1 ring-foreground/10">
            <ScrollFade className="h-full">
              <motion.div
                layout
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                <AnimatePresence initial={false}>
                  {wall.map((camera) => (
                    <CameraTile
                      key={camera.id}
                      camera={camera}
                      dense={cols > 3}
                      active={camera.id === selectedId}
                      onSelect={() => setSelectedId(camera.id)}
                      onExpand={() => setExpandedId(camera.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              <p className="pt-3 pb-1 text-center text-[0.625rem] text-muted-foreground">
                {t("vms.cctv.demoNotice")}
              </p>
            </ScrollFade>
          </div>
        </div>

        {/* Selected camera detail */}
        <aside className="hidden w-[15rem] shrink-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:flex">
          <SelectedCamera
            camera={data.cameras.find((camera) => camera.id === selectedId)}
          />
        </aside>
      </div>

      {/* Fullscreen tile */}
      <AnimatePresence>
        {expanded ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedId(null)}
              className="fixed inset-0 z-40 bg-black/70"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-x-[6%] top-[8%] z-50 mx-auto max-w-[64rem]"
            >
              <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/15">
                <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-3 py-2">
                  <StatusTag hue={STATUS_HUE[expanded.status]} dot>
                    {t(`vms.cctv.${expanded.status}` as never)}
                  </StatusTag>
                  <span className="truncate text-xs font-medium">
                    {expanded.name[locale]}
                  </span>
                  <span className="nums text-[0.625rem] text-muted-foreground">
                    {expanded.code}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ml-auto"
                    onClick={() => setExpandedId(null)}
                  >
                    <X />
                  </Button>
                </div>
                <div className="p-2.5">
                  <CameraTile camera={expanded} dense />
                </div>
                <div className="flex items-center gap-3 border-t border-[var(--hairline)] px-3 py-2 text-[0.625rem] text-muted-foreground">
                  <span>{expanded.zone[locale]}</span>
                  <span className="nums">{expanded.resolution}</span>
                  <span className="nums">
                    {t("vms.cctv.people")} {num(expanded.peopleCount)}
                  </span>
                  <span className="nums ml-auto">
                    {t("vms.cctv.lastMotion")} {relative(expanded.lastMotionAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function SelectedCamera({ camera }: { camera?: Camera }) {
  const { t, locale, num, relative } = useLocale()
  if (!camera) return null

  return (
    <>
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3">
        <span className="truncate text-xs font-medium">{camera.name[locale]}</span>
      </div>
      <ScrollFade className="min-h-0 flex-1">
        <div className="p-2.5">
          <CameraTile camera={camera} dense />
        </div>
        <dl className="flex flex-col gap-1.5 px-3 pb-3">
          <Row label={t("vms.cctv.zone")} value={camera.zone[locale]} />
          <Row label={t("common.status")}>
            <StatusTag hue={STATUS_HUE[camera.status]} dot>
              {t(`vms.cctv.${camera.status}` as never)}
            </StatusTag>
          </Row>
          <Row label={t("vms.cctv.resolution")} value={camera.resolution} />
          <Row label={t("vms.cctv.people")} value={num(camera.peopleCount)} />
          <Row
            label={t("vms.cctv.lastMotion")}
            value={relative(camera.lastMotionAt)}
          />
          <Row label={t("vms.cctv.ptz")}>
            <StatusTag hue={camera.ptz ? "blue" : "slate"}>
              {t(camera.ptz ? "common.enabled" : "common.disabled")}
            </StatusTag>
          </Row>
        </dl>
      </ScrollFade>
    </>
  )
}

function Row({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-surface px-2 py-1.5">
      <dt className="micro">{label}</dt>
      <dd className="nums truncate text-[0.6875rem]">{children ?? value}</dd>
    </div>
  )
}
