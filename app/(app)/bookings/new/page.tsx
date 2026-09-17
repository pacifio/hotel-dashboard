"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Check,
  CreditCard,
  Plus,
  Sparkles,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/motion/avatar-stack"
import { Panel, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import {
  nightsBetween,
  TripRangePicker,
  type DateRange,
} from "@/components/motion/trip-range-picker"
import { cn } from "@/lib/utils"
import { useDataset, useMoney, useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { HUE_VAR } from "@/lib/hue"
import type { Bilingual, RoomTypeId } from "@/lib/types"

const STEPS = [
  "dates",
  "guest",
  "room",
  "extras",
  "payment",
  "confirm",
] as const
type Step = (typeof STEPS)[number]

const EXTRAS: { id: string; label: Bilingual; usd: number }[] = [
  {
    id: "airport",
    label: { en: "Airport transfer", bn: "বিমানবন্দর পরিবহন" },
    usd: 28,
  },
  {
    id: "breakfast",
    label: { en: "Extra breakfast", bn: "অতিরিক্ত নাশতা" },
    usd: 14,
  },
  {
    id: "late",
    label: { en: "Late checkout 4pm", bn: "বিকেল ৪টা পর্যন্ত চেক-আউট" },
    usd: 35,
  },
  { id: "spa", label: { en: "Couples spa hour", bn: "যুগল স্পা" }, usd: 60 },
  { id: "bed", label: { en: "Extra bed", bn: "অতিরিক্ত বিছানা" }, usd: 22 },
  {
    id: "flowers",
    label: { en: "Welcome flowers", bn: "স্বাগত ফুল" },
    usd: 18,
  },
]

export default function NewBookingPage() {
  const data = useDataset()
  const tenant = useTenant()
  const money = useMoney()
  const { t, locale, num, date, pct } = useLocale()

  const [step, setStep] = React.useState<Step>("dates")
  const [range, setRange] = React.useState<DateRange>({})
  const [guestId, setGuestId] = React.useState<string>()
  const [roomTypeId, setRoomTypeId] = React.useState<RoomTypeId>()
  const [extras, setExtras] = React.useState<string[]>([])
  const [method, setMethod] = React.useState("card")

  const stepIndex = STEPS.indexOf(step)
  const nights = nightsBetween(range)
  const roomType = data.roomTypes.find((type) => type.id === roomTypeId)
  const guest = data.guests.find((g) => g.id === guestId)

  const roomCharge = (roomType?.baseRate ?? 0) * nights
  const extrasTotal = extras.reduce((sum, id) => {
    const extra = EXTRAS.find((e) => e.id === id)
    return (
      sum +
      (extra ? (tenant.currency === "USD" ? extra.usd : extra.usd * 118) : 0)
    )
  }, 0)
  const serviceCharge = Math.round((roomCharge + extrasTotal) * 0.1)
  const vat = Math.round((roomCharge + extrasTotal + serviceCharge) * 0.15)
  const grandTotal = roomCharge + extrasTotal + serviceCharge + vat

  const canAdvance = {
    dates: nights > 0,
    guest: !!guestId,
    room: !!roomTypeId,
    extras: true,
    payment: true,
    confirm: true,
  }[step]

  const availableByType = React.useMemo(() => {
    const counts = new Map<RoomTypeId, number>()
    for (const room of data.rooms) {
      if (room.housekeeping === "outOfService") continue
      counts.set(room.typeId, (counts.get(room.typeId) ?? 0) + 1)
    }
    return counts
  }, [data.rooms])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("bookings.newBooking")}
        subtitle={`${tenant.name[locale]} · ${tenant.city[locale]}`}
      />

      {/* Step rail */}
      <div className="flex items-center gap-1 px-5 pb-3">
        {STEPS.map((id, index) => {
          const done = index < stepIndex
          const current = index === stepIndex
          return (
            <React.Fragment key={id}>
              <button
                onClick={() => index <= stepIndex && setStep(id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] transition-colors",
                  current
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "nums flex size-4 items-center justify-center rounded-full text-[0.5625rem]",
                    current
                      ? "bg-primary-foreground/25"
                      : done
                        ? "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]"
                        : "bg-muted"
                  )}
                >
                  {done ? <Check className="size-2.5" /> : num(index + 1)}
                </span>
                {t(`bookings.steps.${id}` as never)}
              </button>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "h-px w-4 transition-colors",
                    done ? "bg-primary" : "bg-[var(--hairline)]"
                  )}
                />
              ) : null}
            </React.Fragment>
          )
        })}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 px-5 pb-5 lg:grid-cols-[1fr_300px]">
        <div className="min-h-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <ScrollFade className="h-full p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                {step === "dates" ? (
                  <div className="flex flex-col items-start gap-4 sm:flex-row">
                    <TripRangePicker value={range} onChange={setRange} />
                    <div className="flex-1 rounded-xl bg-surface p-4">
                      <div className="micro">{t("dashboard.occupancy")}</div>
                      <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted-foreground">
                        {locale === "bn"
                          ? "নির্বাচিত তারিখগুলোতে অকুপেন্সি এবং ভাড়ার প্রবণতা এখানে দেখানো হয়, যাতে দর দেওয়ার আগেই চাহিদার চিত্রটা বোঝা যায়।"
                          : "Occupancy and rate pressure for the selected window, so you can see the demand picture before you quote."}
                      </p>
                      {nights > 0 ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Mini
                            label={t("common.nights")}
                            value={num(nights)}
                          />
                          <Mini
                            label={t("dashboard.occupancy")}
                            value={pct(data.kpis[0].value, 0)}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {step === "guest" ? (
                  <div>
                    <div className="micro pb-2">{t("common.guest")}</div>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {data.guests.slice(0, 8).map((candidate) => (
                        <button
                          key={candidate.id}
                          onClick={() => setGuestId(candidate.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg bg-surface p-2.5 text-left ring-1 transition-all",
                            candidate.id === guestId
                              ? "ring-2 ring-primary"
                              : "ring-foreground/[0.06] hover:bg-muted"
                          )}
                        >
                          <Avatar
                            name={candidate.name[locale]}
                            seed={candidate.avatarSeed}
                            size={28}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.6875rem] font-medium">
                              {candidate.name[locale]}
                            </span>
                            <span className="nums block truncate text-[0.625rem] text-muted-foreground">
                              {candidate.phone}
                            </span>
                          </span>
                          <StatusTag
                            hue={
                              candidate.tier === "platinum" ? "purple" : "teal"
                            }
                          >
                            {t(`crm.tiers.${candidate.tier}` as never)}
                          </StatusTag>
                        </button>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus />
                      {t("common.add")}
                    </Button>
                  </div>
                ) : null}

                {step === "room" ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {data.roomTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setRoomTypeId(type.id)}
                        className={cn(
                          "flex flex-col gap-2 rounded-xl bg-surface p-3 text-left ring-1 transition-all",
                          type.id === roomTypeId
                            ? "ring-2 ring-primary"
                            : "ring-foreground/[0.06] hover:bg-muted"
                        )}
                      >
                        <span
                          className="h-14 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, color-mix(in oklch, ${HUE_VAR[type.hue]} 26%, transparent), transparent)`,
                          }}
                        />
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="size-3 text-muted-foreground" />
                          <span className="text-[0.6875rem] font-medium">
                            {t(`rooms.types.${type.id}` as never)}
                          </span>
                          <StatusTag hue={type.hue} className="ml-auto">
                            {num(availableByType.get(type.id) ?? 0)}
                          </StatusTag>
                        </span>
                        <span className="flex items-baseline gap-1">
                          <span className="nums text-sm font-medium">
                            {money.format(type.baseRate)}
                          </span>
                          <span className="text-[0.625rem] text-muted-foreground">
                            /{t("common.night")}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {step === "extras" ? (
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {EXTRAS.map((extra) => {
                      const on = extras.includes(extra.id)
                      const price =
                        tenant.currency === "USD" ? extra.usd : extra.usd * 118
                      return (
                        <button
                          key={extra.id}
                          onClick={() =>
                            setExtras((prev) =>
                              on
                                ? prev.filter((id) => id !== extra.id)
                                : [...prev, extra.id]
                            )
                          }
                          className={cn(
                            "flex items-center gap-2 rounded-lg bg-surface p-2.5 text-left ring-1 transition-all",
                            on
                              ? "ring-2 ring-primary"
                              : "ring-foreground/[0.06] hover:bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded",
                              on
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {on ? <Check className="size-2.5" /> : null}
                          </span>
                          <span className="flex-1 truncate text-[0.6875rem]">
                            {extra.label[locale]}
                          </span>
                          <span className="nums text-[0.6875rem] font-medium">
                            {money.format(price)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}

                {step === "payment" ? (
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {(
                      [
                        "card",
                        "cash",
                        "bankTransfer",
                        "mobileWallet",
                        "corporate",
                        "ota",
                      ] as const
                    ).map((id) => (
                      <button
                        key={id}
                        onClick={() => setMethod(id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg bg-surface p-2.5 text-left ring-1 transition-all",
                          id === method
                            ? "ring-2 ring-primary"
                            : "ring-foreground/[0.06] hover:bg-muted"
                        )}
                      >
                        <CreditCard className="size-3.5 text-muted-foreground" />
                        <span className="text-[0.6875rem]">
                          {t(`finance.methods.${id}` as never)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {step === "confirm" ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 18,
                      }}
                      className="flex size-12 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]"
                    >
                      <Check className="size-6" />
                    </motion.span>
                    <div>
                      <p className="text-sm font-medium">
                        {t("bookings.bookingConfirmed")}
                      </p>
                      <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                        {t("bookings.confirmationSent", {
                          channel: "WhatsApp",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-primary" />
                      <span className="text-[0.625rem] text-muted-foreground">
                        {locale === "bn"
                          ? "এআই এজেন্ট নিশ্চিতকরণ ও পেমেন্ট লিংক পাঠিয়ে দিয়েছে"
                          : "The AI agent has sent the confirmation and payment link"}
                      </span>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </ScrollFade>
        </div>

        {/* Live rate summary */}
        <Panel
          title={t("bookings.rateSummary")}
          className="min-h-0"
          delay={0.05}
        >
          <div className="flex flex-col gap-2 pt-1">
            {guest ? (
              <div className="flex items-center gap-2 rounded-lg bg-surface p-2.5">
                <Avatar
                  name={guest.name[locale]}
                  seed={guest.avatarSeed}
                  size={26}
                />
                <span className="truncate text-[0.6875rem] font-medium">
                  {guest.name[locale]}
                </span>
              </div>
            ) : (
              <Placeholder icon={<User />} label={t("common.guest")} />
            )}

            {roomType ? (
              <div className="flex items-center gap-2 rounded-lg bg-surface p-2.5">
                <BedDouble className="size-3.5 text-muted-foreground" />
                <span className="text-[0.6875rem] font-medium">
                  {t(`rooms.types.${roomType.id}` as never)}
                </span>
                <span className="nums ml-auto text-[0.6875rem]">
                  {money.format(roomType.baseRate)}
                </span>
              </div>
            ) : (
              <Placeholder icon={<BedDouble />} label={t("common.room")} />
            )}

            {range.from ? (
              <div className="rounded-lg bg-surface p-2.5">
                <div className="flex items-center justify-between">
                  <span className="micro">{t("bookings.checkInDate")}</span>
                  <span className="nums text-[0.6875rem]">{date(range.from)}</span>
                </div>
                {range.to ? (
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="micro">{t("bookings.checkOutDate")}</span>
                    <span className="nums text-[0.6875rem]">{date(range.to)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-1 flex flex-col gap-1.5 border-t border-[var(--hairline)] pt-3">
              <Line
                label={t("bookings.roomCharge")}
                value={money.format(roomCharge)}
              />
              {extrasTotal > 0 ? (
                <Line
                  label={t("bookings.addExtras")}
                  value={money.format(extrasTotal)}
                />
              ) : null}
              <Line
                label={t("bookings.serviceCharge")}
                value={money.format(serviceCharge)}
                muted
              />
              <Line label={t("bookings.vat")} value={money.format(vat)} muted />
            </div>

            <div className="mt-1 flex items-baseline justify-between border-t border-[var(--hairline)] pt-3">
              <span className="micro">{t("bookings.grandTotal")}</span>
              <span className="nums text-lg font-medium">
                {money.format(grandTotal)}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={stepIndex === 0}
                onClick={() => setStep(STEPS[stepIndex - 1])}
              >
                <ArrowLeft />
                {t("common.back")}
              </Button>
              <Button
                size="sm"
                className="flex-1 justify-center"
                disabled={!canAdvance || step === "confirm"}
                onClick={() => {
                  if (stepIndex === STEPS.length - 2) {
                    toast.success(t("bookings.bookingConfirmed"), {
                      description: money.format(grandTotal),
                    })
                  }
                  setStep(STEPS[stepIndex + 1])
                }}
              >
                {step === "payment" ? t("common.confirm") : t("common.next")}
                <ArrowRight />
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Line({
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card p-2.5">
      <div className="micro">{label}</div>
      <div className="nums mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}

function Placeholder({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-2.5 text-muted-foreground">
      <span className="[&_svg]:size-3.5">{icon}</span>
      <span className="text-[0.6875rem]">{label}</span>
    </div>
  )
}
