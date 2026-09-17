import type { AiInsight, SeriesPoint, Tenant } from "@/lib/types"
import type { Rng } from "./rng"

/**
 * Insights are derived from the generated series so the numbers the "AI" cites
 * actually match the charts next to them.
 */
export function buildInsights(
  rng: Rng,
  tenant: Tenant,
  series: SeriesPoint[]
): AiInsight[] {
  const future = series.filter((point) => point.forecast !== undefined)
  const next14 = future.slice(0, 14)
  const peak = next14.reduce((best, point) =>
    point.occupancy > best.occupancy ? point : best
  )
  const trough = next14.reduce((worst, point) =>
    point.occupancy < worst.occupancy ? point : worst
  )
  const avgAdr = Math.round(
    next14.reduce((sum, point) => sum + point.adr, 0) / next14.length
  )
  const uplift = Math.round(avgAdr * 0.08)
  const symbol = tenant.currency === "USD" ? "$" : "৳"
  const fmt = (value: number) => `${symbol}${value.toLocaleString("en-US")}`

  // Insights are generated once, outside React, so the Bangla copy carries its
  // own numerals rather than waiting for a formatter at render time.
  const bn = (value: number) =>
    value.toLocaleString("en-US").replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])
  const fmtBn = (value: number) => `${symbol}${bn(value)}`
  const peakDay = new Date(peak.date).getUTCDate()
  const troughDay = new Date(trough.date).getUTCDate()

  return [
    {
      id: "insight_pricing",
      kind: "pricing",
      hue: "green",
      title: {
        en: `Raise Deluxe rate for the ${peakDay}th`,
        bn: `${bn(peakDay)} তারিখের জন্য ডিলাক্স ভাড়া বাড়ান`,
      },
      body: {
        en: `Forecast occupancy peaks at ${peak.occupancy}% and three comp-set properties are already sold out that night. A ${fmt(uplift)} lift on Deluxe holds demand and adds roughly ${fmt(uplift * Math.round(tenant.roomCount * 0.3))} for the night.`,
        bn: `পূর্বাভাসে অকুপেন্সি সর্বোচ্চ ${bn(peak.occupancy)}% এবং প্রতিযোগী তিনটি হোটেল সেই রাতে ইতিমধ্যে পূর্ণ। ডিলাক্সে ${fmtBn(uplift)} বাড়ালে চাহিদা ধরে রেখেও রাতে প্রায় ${fmtBn(uplift * Math.round(tenant.roomCount * 0.3))} অতিরিক্ত আয় হবে।`,
      },
      impact: uplift * Math.round(tenant.roomCount * 0.3),
      confidence: 0.91,
      action: { en: "Apply rate change", bn: "ভাড়া পরিবর্তন প্রয়োগ করুন" },
    },
    {
      id: "insight_risk",
      kind: "risk",
      hue: "amber",
      title: {
        en: `Soft patch around the ${troughDay}th`,
        bn: `${bn(troughDay)} তারিখের আশেপাশে চাহিদার ঘাটতি`,
      },
      body: {
        en: `Occupancy dips to ${trough.occupancy}% midweek — ${Math.round(((100 - trough.occupancy) / 100) * tenant.roomCount)} rooms unsold. Opening the corporate long-stay rate to your top 12 accounts historically recovers about 60% of that gap.`,
        bn: `সপ্তাহের মাঝে অকুপেন্সি ${bn(trough.occupancy)}%-এ নামছে — ${bn(Math.round(((100 - trough.occupancy) / 100) * tenant.roomCount))}টি কক্ষ অবিক্রীত। শীর্ষ ১২টি কর্পোরেট অ্যাকাউন্টে দীর্ঘমেয়াদি ভাড়া খুলে দিলে সাধারণত এই ঘাটতির প্রায় ৬০% পূরণ হয়।`,
      },
      impact: -Math.round(
        ((100 - trough.occupancy) / 100) * tenant.roomCount * avgAdr
      ),
      confidence: 0.84,
      action: { en: "Open corporate rate", bn: "কর্পোরেট ভাড়া চালু করুন" },
    },
    {
      id: "insight_opportunity",
      kind: "opportunity",
      hue: "blue",
      title: {
        en: "AI agent is converting 34% of WhatsApp enquiries",
        bn: "এআই এজেন্ট হোয়াটসঅ্যাপের ৩৪% অনুসন্ধান বুকিংয়ে রূপান্তর করছে",
      },
      body: {
        en: "That is 11 points above your human-handled baseline, driven mostly by sub-30-second first replies. Extending autopilot to Instagram DMs would cover another 180 enquiries a month at the same conversion.",
        bn: "এটি মানব-পরিচালিত হারের চেয়ে ১১ পয়েন্ট বেশি, মূলত ৩০ সেকেন্ডের কম সময়ে প্রথম উত্তরের কারণে। ইনস্টাগ্রাম ডিএম-এ অটোপাইলট চালু করলে একই হারে মাসে আরও ১৮০টি অনুসন্ধান সামলানো যাবে।",
      },
      impact: Math.round(180 * 0.34 * avgAdr * 2),
      confidence: 0.88,
      action: { en: "Enable on Instagram", bn: "ইনস্টাগ্রামে চালু করুন" },
    },
    {
      id: "insight_ops",
      kind: "operations",
      hue: "purple",
      title: {
        en: "Housekeeping will run short on Friday",
        bn: "শুক্রবার হাউসকিপিংয়ে কর্মী ঘাটতি হবে",
      },
      body: {
        en: `${Math.round(tenant.roomCount * 0.34)} departures land on Friday against 9 attendants rostered — roughly 2.1 rooms per attendant-hour versus your 1.6 standard. Moving two evening-shift attendants earlier closes the gap.`,
        bn: `শুক্রবার ${bn(Math.round(tenant.roomCount * 0.34))}টি প্রস্থানের বিপরীতে রোস্টারে মাত্র ৯ জন পরিচারক — প্রতি কর্মী-ঘণ্টায় প্রায় ২.১টি কক্ষ, যেখানে মান ১.৬। সন্ধ্যার শিফটের দুজনকে আগে আনলেই ঘাটতি মিটে যায়।`,
      },
      impact: 0,
      confidence: 0.79,
      action: { en: "Adjust roster", bn: "রোস্টার সমন্বয় করুন" },
    },
  ]
}
