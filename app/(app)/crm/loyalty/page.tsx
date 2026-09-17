"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Award } from "lucide-react"

import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useMoney } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { CHART_COLORS } from "@/lib/hue"
import type { LoyaltyTier, TagHue } from "@/lib/types"

const TIERS: { id: LoyaltyTier; hue: TagHue }[] = [
  { id: "member", hue: "slate" },
  { id: "silver", hue: "teal" },
  { id: "gold", hue: "amber" },
  { id: "platinum", hue: "purple" },
]

export default function LoyaltyPage() {
  const data = useDataset()
  const money = useMoney()
  const { t, locale, num, pct } = useLocale()

  const tiers = React.useMemo(
    () =>
      TIERS.map((tier, index) => {
        const guests = data.guests.filter((guest) => guest.tier === tier.id)
        return {
          ...tier,
          count: guests.length,
          value: guests.reduce((sum, guest) => sum + guest.lifetimeValue, 0),
          share: (guests.length / data.guests.length) * 100,
          color: CHART_COLORS[index],
          top: guests
            .slice()
            .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
            .slice(0, 5),
        }
      }),
    [data.guests]
  )

  const kpis = React.useMemo(
    () =>
      tiers.map((tier) => ({
        id: tier.id,
        label: t(`crm.tiers.${tier.id}` as never),
        value: tier.count,
        color: tier.color,
      })),
    [tiers, t]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("crm.loyalty")} subtitle={t("nav.groups.crm")} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        <KpiStrip cells={kpis} />
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Panel
                title={
                  <span className="flex items-center gap-1.5">
                    <Award
                      className="size-3"
                      style={{ color: `var(--hue-${tier.hue})` }}
                    />
                    {t(`crm.tiers.${tier.id}` as never)}
                  </span>
                }
                actions={
                  <StatusTag hue={tier.hue}>{pct(tier.share, 0)}</StatusTag>
                }
              >
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="figure text-xl">{num(tier.count)}</span>
                  <span className="nums text-[0.625rem] text-muted-foreground">
                    {money.compact(tier.value)}
                  </span>
                </div>
                <ScrollFade className="mt-3 max-h-[168px]">
                  <div className="flex flex-col gap-1">
                    {tier.top.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5"
                      >
                        <Avatar
                          name={guest.name[locale]}
                          seed={guest.avatarSeed}
                          size={20}
                        />
                        <span className="truncate text-[0.625rem]">
                          {guest.name[locale]}
                        </span>
                        <span className="nums ml-auto text-[0.625rem] text-muted-foreground">
                          {money.compact(guest.lifetimeValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollFade>
              </Panel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
