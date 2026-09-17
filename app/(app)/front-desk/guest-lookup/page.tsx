"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { BedDouble, Mail, Phone, Search, Star } from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, EmptyState, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { cn } from "@/lib/utils"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { LoyaltyTier, TagHue } from "@/lib/types"

const TIER_HUE: Record<LoyaltyTier, TagHue> = {
  member: "slate",
  silver: "teal",
  gold: "amber",
  platinum: "purple",
}

export default function GuestLookupPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, locale, num, date } = useLocale()
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string>()

  const results = React.useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data.guests.slice(0, 18)
    return data.guests
      .filter(
        (guest) =>
          guest.name.en.toLowerCase().includes(normalized) ||
          guest.name.bn.includes(normalized) ||
          guest.email.toLowerCase().includes(normalized) ||
          guest.phone.includes(normalized)
      )
      .slice(0, 40)
  }, [data.guests, query])

  const selected = data.guests.find((guest) => guest.id === selectedId)
  const stays = React.useMemo(
    () =>
      selected
        ? data.reservations
            .filter((r) => r.guestId === selected.id)
            .slice(0, 10)
        : [],
    [data.reservations, selected]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("frontDesk.guestLookup")}
        subtitle={t("nav.groups.operations")}
      />
      <div className="px-5 pb-3">
        <div className="relative mx-auto max-w-[560px]">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("frontDesk.lookupPlaceholder")}
            className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 px-5 pb-5 lg:grid-cols-[1fr_360px]">
        <Panel
          title={
            t("common.noResults") &&
            `${num(results.length)} ${t("common.guests").toLowerCase()}`
          }
          className="min-h-0"
          bodyClassName="min-h-0 px-0"
        >
          <ScrollFade className="h-full px-2">
            {results.map((guest) => (
              <button
                key={guest.id}
                onClick={() => setSelectedId(guest.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                  guest.id === selectedId
                    ? "bg-sidebar-accent"
                    : "hover:bg-muted/60"
                )}
              >
                <Avatar
                  name={guest.name[locale]}
                  seed={guest.avatarSeed}
                  size={28}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.6875rem] font-medium">
                    {guest.name[locale]}
                  </span>
                  <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                    {guest.email} · {guest.phone}
                  </span>
                </span>
                <StatusTag hue={TIER_HUE[guest.tier]} dot>
                  {t(`crm.tiers.${guest.tier}` as never)}
                </StatusTag>
                <span className="nums w-20 shrink-0 text-right text-[0.625rem] text-muted-foreground">
                  {money.compact(guest.lifetimeValue)}
                </span>
              </button>
            ))}
            {results.length === 0 ? (
              <EmptyState
                icon={<Search />}
                title={t("common.noResults")}
                hint={t("common.noResultsHint")}
              />
            ) : null}
          </ScrollFade>
        </Panel>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-0"
            >
              <Panel title={t("inbox.guest360")} className="h-full min-h-0">
                <div className="flex flex-col items-center gap-2 pb-3">
                  <Avatar
                    name={selected.name[locale]}
                    seed={selected.avatarSeed}
                    size={48}
                  />
                  <div className="text-center">
                    <div className="text-xs font-medium">
                      {selected.name[locale]}
                    </div>
                    <div className="text-[0.625rem] text-muted-foreground">
                      {selected.nationality[locale]}
                    </div>
                  </div>
                  <StatusTag hue={TIER_HUE[selected.tier]} dot>
                    {t(`crm.tiers.${selected.tier}` as never)}
                  </StatusTag>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Tile
                    label={t("frontDesk.totalStays")}
                    value={num(selected.stays)}
                  />
                  <Tile
                    label={t("frontDesk.lifetimeValue")}
                    value={money.compact(selected.lifetimeValue)}
                  />
                </div>

                <div className="mt-3 flex flex-col gap-1.5">
                  <Row
                    icon={<Mail className="size-3" />}
                    value={selected.email}
                  />
                  <Row
                    icon={<Phone className="size-3" />}
                    value={selected.phone}
                  />
                </div>

                <div className="mt-3">
                  <div className="micro pb-1.5">
                    {t("frontDesk.preferences")}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selected.preferences.map((preference, index) => (
                      <StatusTag key={index} hue="blue">
                        {preference[locale]}
                      </StatusTag>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="micro pb-1.5">
                    {t("frontDesk.stayHistory")}
                  </div>
                  <div className="flex flex-col gap-1">
                    {stays.map((stay) => (
                      <div
                        key={stay.id}
                        className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5"
                      >
                        <BedDouble className="size-3 shrink-0 text-muted-foreground" />
                        <span className="nums truncate text-[0.625rem]">
                          {stay.code}
                        </span>
                        <span className="nums text-[0.625rem] text-muted-foreground">
                          {date(stay.checkIn)}
                        </span>
                        <span className="nums ml-auto text-[0.625rem] font-medium">
                          {money.compact(stay.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </motion.div>
          ) : (
            <Panel title={t("inbox.guest360")} className="min-h-0">
              <EmptyState
                icon={<Star />}
                title={t("frontDesk.guestLookup")}
                hint={t("frontDesk.lookupPlaceholder")}
              />
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-2.5">
      <div className="micro">{label}</div>
      <div className="nums mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}

function Row({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
      {icon}
      <span className="nums truncate">{value}</span>
    </div>
  )
}
