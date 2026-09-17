"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { motion } from "motion/react"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/provider"

export type { ColumnDef }

/**
 * crm.jpg's table: hairline rows, accent bulk-select checkboxes with an
 * indeterminate header state, click-to-sort headers and a sticky header band.
 */
export function DataTable<T>({
  data,
  columns,
  globalFilter,
  onGlobalFilterChange,
  selectable = false,
  onRowClick,
  rowId,
  emptyIcon,
  className,
  toolbar,
  pageSize = 50,
}: {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  selectable?: boolean
  onRowClick?: (row: T) => void
  rowId?: (row: T) => string
  emptyIcon?: React.ReactNode
  className?: string
  toolbar?: React.ReactNode
  pageSize?: number
}) {
  const { t, num } = useLocale()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Paginated rather than virtualised: a hotel's booking list runs to
    // thousands of rows, and rendering them all stalls the first paint.
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    getRowId: rowId ? (row) => rowId(row) : undefined,
  })

  const rows = table.getRowModel().rows
  const selectedCount = Object.values(selected).filter(Boolean).length
  const allSelected = rows.length > 0 && selectedCount === rows.length

  return (
    <div
      data-slot="data-table"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10",
        className
      )}
    >
      {toolbar || selectable ? (
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3">
          {selectedCount > 0 ? (
            <motion.span
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="nums rounded-full bg-primary/12 px-2 py-0.5 text-[0.625rem] font-medium text-primary"
            >
              {t("common.selected", { count: num(selectedCount) })}
            </motion.span>
          ) : null}
          {toolbar}
        </div>
      ) : null}

      <ScrollFade className="min-h-0 flex-1">
        <table className="w-full border-separate border-spacing-0 text-xs">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {selectable ? (
                  <th className="w-8 border-b border-[var(--hairline)] bg-surface/95 px-3 py-2 backdrop-blur-xl">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selectedCount > 0 && !allSelected}
                      onCheckedChange={(checked) =>
                        setSelected(
                          checked
                            ? Object.fromEntries(
                                rows.map((row) => [row.id, true])
                              )
                            : {}
                        )
                      }
                    />
                  </th>
                ) : null}
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const align = (
                    header.column.columnDef.meta as
                      { align?: "right" } | undefined
                  )?.align
                  return (
                    <th
                      key={header.id}
                      onClick={
                        sortable
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={cn(
                        "border-b border-[var(--hairline)] bg-surface/95 px-3 py-2 text-[0.625rem] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase backdrop-blur-xl",
                        align === "right" ? "text-right" : "text-left",
                        sortable &&
                          "cursor-pointer select-none hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          align === "right" && "flex-row-reverse"
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sorted === "asc" ? (
                          <ArrowUp className="size-2.5" />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="size-2.5" />
                        ) : null}
                      </span>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index, 18) * 0.012 }}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "group/row transition-colors",
                  selected[row.id] ? "bg-primary/[0.06]" : "hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {selectable ? (
                  <td
                    className="border-b border-[var(--hairline)] px-3 py-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      checked={!!selected[row.id]}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => ({
                          ...prev,
                          [row.id]: !!checked,
                        }))
                      }
                    />
                  </td>
                ) : null}
                {row.getVisibleCells().map((cell) => {
                  const align = (
                    cell.column.columnDef.meta as
                      { align?: "right" } | undefined
                  )?.align
                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "border-b border-[var(--hairline)] px-3 py-2 align-middle",
                        align === "right" && "nums text-right tabular-nums"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <EmptyState
            icon={emptyIcon ?? <Search />}
            title={t("common.noResults")}
            hint={t("common.noResultsHint")}
          />
        ) : null}
      </ScrollFade>

      {table.getPageCount() > 1 ? (
        <div className="flex h-9 shrink-0 items-center gap-2 border-t border-[var(--hairline)] px-3">
          <span className="nums text-[0.625rem] text-muted-foreground">
            {num(table.getState().pagination.pageIndex * pageSize + 1)}–
            {num(
              Math.min(
                (table.getState().pagination.pageIndex + 1) * pageSize,
                table.getFilteredRowModel().rows.length
              )
            )}{" "}
            {t("common.of")} {num(table.getFilteredRowModel().rows.length)}
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="nums px-1.5 text-[0.625rem] text-muted-foreground">
              {num(table.getState().pagination.pageIndex + 1)} /{" "}
              {num(table.getPageCount())}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Shared search input for table toolbars. */
export function TableSearch({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const { t } = useLocale()
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? t("common.search")}
        className="h-7 w-[180px] rounded-full border border-border bg-card pr-2.5 pl-7 text-[0.6875rem] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      />
    </div>
  )
}
