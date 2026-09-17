"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  BookOpen,
  Brain,
  ChartColumn,
  Database,
  Download,
  FileText,
  Layers,
  PenLine,
  Search,
  Share2,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { MiniTooltip } from "@/components/ai/tool-call-card"
import { PageHeader } from "@/components/motion/card-shell"
import {
  PipelineRunner,
  usePipeline,
  type PipelineStep,
} from "@/components/motion/pipeline-runner"
import { KpiStrip } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { StreamingText } from "@/components/motion/streaming-text"
import { useDataset, useMoney, useTenant } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import { demoToday } from "@/lib/demo-time"
import { CHART_COLORS } from "@/lib/hue"
import { cn } from "@/lib/utils"

const TEMPLATES = [
  {
    id: "revpar",
    en: "RevPAR by segment vs last year",
    bn: "সেগমেন্ট অনুযায়ী রেভপার, গত বছরের সাথে তুলনা",
  },
  {
    id: "pace",
    en: "90-day booking pace report",
    bn: "৯০ দিনের বুকিং গতি প্রতিবেদন",
  },
  {
    id: "channel",
    en: "Channel profitability after commission",
    bn: "কমিশন বাদে চ্যানেল লাভজনকতা",
  },
  {
    id: "housekeeping",
    en: "Housekeeping productivity by floor",
    bn: "তলা অনুযায়ী হাউসকিপিং উৎপাদনশীলতা",
  },
  {
    id: "corporate",
    en: "Corporate account health check",
    bn: "কর্পোরেট অ্যাকাউন্ট স্বাস্থ্য পরীক্ষা",
  },
]

export default function ReportStudioPage() {
  const data = useDataset()
  const tenant = useTenant()
  const money = useMoney()
  const { t, locale, num, date, pct } = useLocale()
  const [prompt, setPrompt] = React.useState("")

  const steps = React.useMemo<PipelineStep[]>(
    () => [
      {
        id: "understand",
        title: t("ai.pipeline.understand"),
        hint: t("ai.pipeline.understandHint"),
        icon: <Brain />,
        duration: 900,
        fill: "line",
      },
      {
        id: "query",
        title: t("ai.pipeline.query"),
        hint: t("ai.pipeline.queryHint"),
        icon: <Database />,
        duration: 1400,
        fill: "bars",
        detail: `SELECT … FROM reservations WHERE property = '${tenant.slug}'`,
      },
      {
        id: "aggregate",
        title: t("ai.pipeline.aggregate"),
        hint: t("ai.pipeline.aggregateHint"),
        icon: <Layers />,
        duration: 1100,
        fill: "bits",
      },
      {
        id: "analyze",
        title: t("ai.pipeline.analyze"),
        hint: t("ai.pipeline.analyzeHint"),
        icon: <Search />,
        duration: 1300,
        fill: "line",
      },
      {
        id: "compose",
        title: t("ai.pipeline.compose"),
        hint: t("ai.pipeline.composeHint"),
        icon: <PenLine />,
        duration: 1500,
        fill: "bars",
      },
      {
        id: "chart",
        title: t("ai.pipeline.chart"),
        hint: t("ai.pipeline.chartHint"),
        icon: <ChartColumn />,
        duration: 1000,
        fill: "none",
      },
    ],
    [t, tenant.slug]
  )

  const pipeline = usePipeline(steps)
  const done = pipeline.state === "done"

  const segments = React.useMemo(() => {
    const totals = new Map<string, number>()
    for (const company of data.companies) {
      totals.set(
        company.segment,
        (totals.get(company.segment) ?? 0) + company.accountValue
      )
    }
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([segment, value], index) => ({
        segment,
        label: t(`crm.segments.${segment}` as never),
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
  }, [data.companies, t])

  const monthly = React.useMemo(() => {
    const buckets = new Map<string, { rooms: number; fnb: number }>()
    for (const point of data.series.slice(0, 91)) {
      const key = date(point.date, { month: "short" })
      const bucket = buckets.get(key) ?? { rooms: 0, fnb: 0 }
      bucket.rooms += point.rooms
      bucket.fnb += point.fnb
      buckets.set(key, bucket)
    }
    return [...buckets.entries()].map(([label, value]) => ({ label, ...value }))
  }, [data.series, date])

  const kpis = React.useMemo(
    () =>
      data.kpis.slice(0, 3).map((kpi, index) => ({
        id: kpi.id,
        label: t(kpi.labelKey as never),
        value: kpi.value,
        delta: kpi.delta,
        prefix: kpi.format === "currency" ? money.symbol : undefined,
        suffix: kpi.format === "percent" ? "%" : undefined,
        color: CHART_COLORS[index],
      })),
    [data.kpis, t, money.symbol]
  )

  const narrative =
    locale === "bn"
      ? `গত ৯০ দিনে ${tenant.name.bn} এর রেভপার আগের প্রান্তিকের তুলনায় ${num(Math.abs(data.kpis[2].delta), { maximumFractionDigits: 1 })}% বেড়েছে, এবং প্রায় পুরো বৃদ্ধিটাই এসেছে ভাড়া থেকে, অকুপেন্সি থেকে নয় — যা স্বাস্থ্যকর। এন্টারপ্রাইজ ও এয়ারলাইন সেগমেন্ট মিলে অ্যাকাউন্ট মূল্যের সিংহভাগ ধরে রেখেছে, তবে মিড-মার্কেট সেগমেন্টে কক্ষ-রাত প্রতি আয় সবচেয়ে দ্রুত বাড়ছে। ঝুঁকি একটাই: ওটিএ নির্ভরতা এখনও এক-তৃতীয়াংশের বেশি, এবং সেখানে কমিশন বাদ দিলে প্রকৃত রেভপার প্রায় ৯% কম।`
      : `Over the last 90 days ${tenant.name.en} lifted RevPAR ${num(Math.abs(data.kpis[2].delta), { maximumFractionDigits: 1 })}% against the prior quarter, and almost all of that came from rate rather than occupancy — which is the healthy way to get it. Enterprise and airline accounts still carry the majority of account value, but mid-market is growing revenue per room night fastest. The one real risk is channel concentration: OTAs remain over a third of the mix, and once commission is netted off, true RevPAR on those room nights runs about 9% lower.`

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("ai.reportStudio")}
        subtitle={t("ai.reportStudioSubtitle")}
      >
        <Button variant="outline" size="sm" disabled={!done}>
          <Share2 />
          {t("common.share")}
        </Button>
        <Button variant="outline" size="sm" disabled={!done}>
          <Download />
          {t("common.export")}
        </Button>
      </PageHeader>

      <div className="grid min-h-0 flex-1 gap-3 px-5 pb-5 lg:grid-cols-[340px_1fr]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              placeholder={t("ai.reportPlaceholder")}
              className="w-full resize-none bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <div className="micro pt-2 pb-1.5">{t("ai.templates")}</div>
            <div className="flex flex-wrap gap-1">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setPrompt(template[locale])}
                  className="rounded-full border border-border px-2 py-0.5 text-[0.625rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {template[locale]}
                </button>
              ))}
            </div>
          </div>

          <PipelineRunner
            steps={steps}
            title={t("ai.reportStudio")}
            state={pipeline.state}
            active={pipeline.active}
            elapsed={pipeline.elapsed}
            onRun={pipeline.run}
            onReset={pipeline.reset}
            runLabel={
              pipeline.state === "running"
                ? t("ai.running")
                : t("ai.runPipeline")
            }
            className="min-h-0 flex-1"
            footer={
              <span className="truncate">
                {done ? t("ai.regenerate") : t("ai.reportStudioSubtitle")}
              </span>
            }
          />
        </div>

        {/* The generated document */}
        <div className="min-h-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <ScrollFade className="h-full">
            <AnimatePresence mode="wait">
              {pipeline.state === "idle" ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <FileText className="size-5" />
                  </span>
                  <p className="text-sm font-medium">{t("ai.reportStudio")}</p>
                  <p className="max-w-[40ch] text-[0.6875rem] text-muted-foreground">
                    {t("ai.reportStudioSubtitle")}
                  </p>
                </motion.div>
              ) : (
                <motion.article
                  key="report"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-auto max-w-[760px] p-6"
                >
                  <div className="flex items-center gap-2">
                    <StatusTag hue="blue" dot>
                      <Sparkles className="size-2" />
                      {t("common.ai")}
                    </StatusTag>
                    <span className="nums text-[0.625rem] text-muted-foreground">
                      {date(demoToday(), {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-medium tracking-tight">
                    {prompt || TEMPLATES[0][locale]}
                  </h2>
                  <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
                    {tenant.name[locale]} · {tenant.city[locale]}
                  </p>

                  <Section
                    show={pipeline.active >= 2}
                    title={t("dashboard.todayAtAGlance")}
                  >
                    <KpiStrip cells={kpis} />
                  </Section>

                  <Section
                    show={pipeline.active >= 4}
                    title={t("ai.narrative")}
                  >
                    <p className="text-xs leading-relaxed">
                      <StreamingText
                        text={narrative}
                        enabled={pipeline.active >= 4}
                        charsPerTick={5}
                        minDelay={6}
                        maxDelay={18}
                      />
                    </p>
                  </Section>

                  <Section
                    show={pipeline.active >= 5 || done}
                    title={t("finance.bySegment")}
                  >
                    <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={monthly}
                            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                          >
                            <CartesianGrid
                              vertical={false}
                              stroke="var(--hairline)"
                            />
                            <XAxis
                              dataKey="label"
                              tick={{
                                fontSize: 9,
                                fill: "var(--muted-foreground)",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{
                                fontSize: 9,
                                fill: "var(--muted-foreground)",
                              }}
                              axisLine={false}
                              tickLine={false}
                              width={52}
                              tickFormatter={(value) =>
                                money.compact(Number(value))
                              }
                            />
                            <Tooltip
                              content={<MiniTooltip money />}
                              cursor={false}
                            />
                            <Bar
                              dataKey="rooms"
                              stackId="a"
                              fill="var(--chart-1)"
                              radius={[0, 0, 0, 0]}
                            />
                            <Bar
                              dataKey="fnb"
                              stackId="a"
                              fill="var(--chart-2)"
                              radius={[3, 3, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={segments}
                              dataKey="value"
                              nameKey="label"
                              innerRadius={40}
                              outerRadius={68}
                              paddingAngle={2}
                              stroke="none"
                            >
                              {segments.map((segment) => (
                                <Cell
                                  key={segment.segment}
                                  fill={segment.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<MiniTooltip money />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                      {segments.map((segment) => (
                        <span
                          key={segment.segment}
                          className="flex items-center gap-1.5 text-[0.625rem]"
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ background: segment.color }}
                          />
                          <span className="truncate text-muted-foreground">
                            {segment.label}
                          </span>
                          <span className="nums ml-auto">
                            {money.compact(segment.value)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </Section>

                  <Section show={done} title={t("ai.sources")}>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        t("nav.bookings"),
                        t("nav.folios"),
                        t("nav.companies"),
                        t("nav.channels"),
                        t("reports.nightAudit"),
                      ].map((source) => (
                        <span
                          key={source}
                          className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[0.625rem] text-muted-foreground"
                        >
                          <BookOpen className="size-2.5" />
                          {source}
                        </span>
                      ))}
                    </div>
                  </Section>
                </motion.article>
              )}
            </AnimatePresence>
          </ScrollFade>
        </div>
      </div>
    </div>
  )
}

function Section({
  show,
  title,
  children,
}: {
  show: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <h3 className={cn("micro pb-2")}>{title}</h3>
          {children}
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}
