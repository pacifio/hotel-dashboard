import type { Kpi, SeriesPoint } from "@/lib/types"

/** Index of the anchor day inside the generated 181-day series. */
export const SERIES_TODAY_INDEX = 90

const avg = (rows: SeriesPoint[], key: keyof SeriesPoint) =>
  rows.length
    ? rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0) / rows.length
    : 0

const totalRevenue = (rows: SeriesPoint[]) =>
  rows.reduce(
    (sum, row) => sum + row.rooms + row.fnb + row.spa + row.events + row.other,
    0
  )

/**
 * KPIs for an arbitrary window, compared against the equal-length window that
 * immediately precedes it. The dataset ships a 30-day default; this recomputes
 * them whenever the reporting range changes.
 */
export function computeKpis(
  series: SeriesPoint[],
  start: number,
  end: number
): Kpi[] {
  const current = series.slice(start, end)
  const length = Math.max(1, end - start)
  const previous = series.slice(Math.max(0, start - length), start)

  const delta = (key: keyof SeriesPoint) => {
    const now = avg(current, key)
    const before = avg(previous, key)
    if (!before) return 0
    return Number((((now - before) / before) * 100).toFixed(1))
  }

  const spark = (key: keyof SeriesPoint) =>
    current.map((row) => Number(row[key] ?? 0))

  const revenue = totalRevenue(current)
  const previousRevenue = totalRevenue(previous)

  return [
    {
      id: "occupancy",
      labelKey: "dashboard.occupancy",
      value: Number(avg(current, "occupancy").toFixed(1)),
      delta: delta("occupancy"),
      format: "percent",
      spark: spark("occupancy"),
    },
    {
      id: "adr",
      labelKey: "dashboard.adr",
      value: Math.round(avg(current, "adr")),
      delta: delta("adr"),
      format: "currency",
      spark: spark("adr"),
    },
    {
      id: "revpar",
      labelKey: "dashboard.revpar",
      value: Math.round(avg(current, "revpar")),
      delta: delta("revpar"),
      format: "currency",
      spark: spark("revpar"),
    },
    {
      id: "totalRevenue",
      labelKey: "dashboard.totalRevenue",
      value: revenue,
      delta: previousRevenue
        ? Number(
            (((revenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
          )
        : 0,
      format: "currency",
      spark: current.map(
        (row) => row.rooms + row.fnb + row.spa + row.events + row.other
      ),
    },
  ]
}
