"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { FileText, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, EmptyState, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useLookups, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { FolioLine, TagHue } from "@/lib/types"

const DEPT_HUE: Record<FolioLine["department"], TagHue> = {
  rooms: "blue",
  fnb: "amber",
  spa: "magenta",
  events: "purple",
  other: "slate",
}

export default function FoliosPage() {
  const data = useDataset()
  const lookups = useLookups()
  const money = useMoney()
  const { t, locale, num, date } = useLocale()
  const [selectedId, setSelectedId] = React.useState(data.folios[0]?.id)

  React.useEffect(() => setSelectedId(data.folios[0]?.id), [data.folios])

  const selected = data.folios.find((folio) => folio.id === selectedId)
  const guest = selected ? lookups.guest.get(selected.guestId) : undefined
  const charges =
    selected?.lines.reduce((sum, line) => sum + line.amount, 0) ?? 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("finance.folios")}
        subtitle={`${num(data.folios.length)} ${t("dashboard.inHouse").toLowerCase()}`}
      >
        <Button variant="outline" size="sm">
          <Printer />
          {t("common.print")}
        </Button>
      </PageHeader>

      <div className="grid min-h-0 flex-1 gap-3 px-5 pb-5 lg:grid-cols-[300px_1fr]">
        <Panel
          title={t("finance.folios")}
          className="min-h-0"
          bodyClassName="min-h-0 px-0"
        >
          <ScrollFade className="h-full px-2">
            {data.folios.map((folio) => {
              const folioGuest = lookups.guest.get(folio.guestId)
              return (
                <button
                  key={folio.id}
                  onClick={() => setSelectedId(folio.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                    folio.id === selectedId
                      ? "bg-sidebar-accent"
                      : "hover:bg-muted/60"
                  )}
                >
                  <Avatar
                    name={folioGuest?.name[locale] ?? "—"}
                    seed={folioGuest?.avatarSeed}
                    size={24}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.6875rem] font-medium">
                      {folioGuest?.name[locale]}
                    </span>
                    <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                      {folio.number}
                    </span>
                  </span>
                  <span className="nums shrink-0 text-[0.6875rem] font-medium">
                    {money.compact(folio.balance)}
                  </span>
                </button>
              )
            })}
          </ScrollFade>
        </Panel>

        <AnimatePresence mode="wait">
          {selected && guest ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-0"
            >
              <Panel
                title={
                  <span className="flex items-center gap-2">
                    <Avatar
                      name={guest.name[locale]}
                      seed={guest.avatarSeed}
                      size={22}
                    />
                    {guest.name[locale]}
                  </span>
                }
                subtitle={selected.number}
                actions={
                  <StatusTag hue={selected.open ? "green" : "slate"} dot>
                    {selected.open ? t("common.live") : t("common.done")}
                  </StatusTag>
                }
                className="h-full min-h-0"
                bodyClassName="min-h-0 flex flex-col"
              >
                <ScrollFade className="min-h-0 flex-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--hairline)]">
                        <th className="micro py-2 text-left">
                          {t("common.date")}
                        </th>
                        <th className="micro py-2 text-left">
                          {t("finance.charges")}
                        </th>
                        <th className="micro py-2 text-left">
                          {t("finance.byDepartment")}
                        </th>
                        <th className="micro py-2 text-right">
                          {t("common.amount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.lines.map((line, index) => (
                        <motion.tr
                          key={line.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-[var(--hairline)]"
                        >
                          <td className="nums py-2 text-muted-foreground">
                            {date(line.at)}
                          </td>
                          <td className="py-2">{line.description[locale]}</td>
                          <td className="py-2">
                            <StatusTag hue={DEPT_HUE[line.department]}>
                              {t(`dashboard.${line.department}` as never)}
                            </StatusTag>
                          </td>
                          <td className="nums py-2 text-right">
                            {money.format(line.amount)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollFade>

                <div className="mt-3 flex flex-col gap-1.5 border-t border-[var(--hairline)] pt-3">
                  <Row
                    label={t("finance.charges")}
                    value={money.format(charges)}
                  />
                  <Row
                    label={t("finance.credits")}
                    value={`−${money.format(Math.max(0, charges - selected.balance))}`}
                    muted
                  />
                  <div className="flex items-baseline justify-between pt-1.5">
                    <span className="micro">{t("frontDesk.balance")}</span>
                    <span className="nums text-lg font-medium">
                      {money.format(selected.balance)}
                    </span>
                  </div>
                </div>
              </Panel>
            </motion.div>
          ) : (
            <Panel title={t("finance.folios")} className="min-h-0">
              <EmptyState icon={<FileText />} title={t("common.noResults")} />
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={cn("text-[0.6875rem]", muted && "text-muted-foreground")}>
        {label}
      </span>
      <span
        className={cn("nums text-[0.6875rem]", muted && "text-muted-foreground")}
      >
        {value}
      </span>
    </div>
  )
}
