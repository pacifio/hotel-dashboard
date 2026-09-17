"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Bot, Workflow } from "lucide-react"

import { DataTable, TableSearch } from "@/components/motion/data-table"
import { PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { ChannelBadge } from "@/components/icons/channel-icons"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { AgentRun } from "@/lib/types"

export default function AgentRunsPage() {
  const data = useDataset()
  const { t, locale, num, relative, duration } = useLocale()
  const [query, setQuery] = React.useState("")

  const columns = React.useMemo<ColumnDef<AgentRun, unknown>[]>(
    () => [
      {
        accessorFn: (row) => row.agent[locale],
        id: "agent",
        header: t("ai.agentRuns"),
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <Bot className="size-3 text-primary" />
            <span className="font-medium">{row.original.agent[locale]}</span>
          </span>
        ),
      },
      {
        accessorFn: (row) => row.trigger[locale],
        id: "trigger",
        header: t("common.actions"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.trigger[locale]}
          </span>
        ),
      },
      {
        accessorKey: "channel",
        header: t("inbox.allChannels"),
        cell: ({ row }) =>
          row.original.channel ? (
            <ChannelBadge channel={row.original.channel} size={20} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <StatusTag
              hue={
                status === "success"
                  ? "green"
                  : status === "escalated"
                    ? "amber"
                    : status === "running"
                      ? "blue"
                      : "rose"
              }
              dot
            >
              {t(`ai.status.${status}` as never)}
            </StatusTag>
          )
        },
      },
      {
        accessorKey: "steps",
        header: t("ai.pipeline.understand"),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.steps),
      },
      {
        accessorKey: "tokens",
        header: t("ai.tokens", { count: "" }).trim(),
        meta: { align: "right" },
        cell: ({ row }) => num(row.original.tokens),
      },
      {
        accessorKey: "durationMs",
        header: t("common.time"),
        meta: { align: "right" },
        cell: ({ row }) => duration(row.original.durationMs / 1000),
      },
      {
        accessorKey: "startedAt",
        header: t("common.date"),
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {relative(row.original.startedAt)}
          </span>
        ),
      },
    ],
    [t, locale, num, relative, duration]
  )

  const kpis = React.useMemo(() => {
    const total = data.agentRuns.length
    const ok = data.agentRuns.filter((r) => r.status === "success").length
    const tokens = data.agentRuns.reduce((sum, r) => sum + r.tokens, 0)
    const avgMs =
      data.agentRuns.reduce((sum, r) => sum + r.durationMs, 0) / (total || 1)
    return [
      { id: "runs", label: t("ai.agentRuns"), value: total },
      {
        id: "success",
        label: t("common.status"),
        value: Math.round((ok / (total || 1)) * 100),
        suffix: "%",
        delta: 4.2,
      },
      {
        id: "tokens",
        label: t("ai.tokens", { count: "" }).trim(),
        value: tokens,
        format: { notation: "compact" as const },
      },
      {
        id: "latency",
        label: t("common.time"),
        value: Math.round(avgMs),
        suffix: " ms",
      },
    ]
  }, [data.agentRuns, t])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("ai.agentRuns")}
        subtitle={t("nav.groups.intelligence")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.agentRuns}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Workflow />}
          className="min-h-0 flex-1"
          toolbar={
            <TableSearch
              value={query}
              onChange={setQuery}
              className="ml-auto"
            />
          }
        />
      </div>
    </div>
  )
}
