import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "./Button"
import { cn } from "../lib/utils"

function DataTablePagination({
  table,
  className,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  showPageSize = true,
}) {
  if (!table) return null

  const selectedRows = table.getFilteredSelectedRowModel?.().rows?.length ?? 0
  const filteredRows = table.getFilteredRowModel?.().rows?.length ?? 0
  const pagination = table.getState?.().pagination || { pageIndex: 0, pageSize: pageSizeOptions[0] }

  const pageIndex = pagination.pageIndex ?? 0
  const pageSize = pagination.pageSize ?? pageSizeOptions[0]
  const pageCount = table.getPageCount?.() ?? 1

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        "flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50/70 px-3.5 py-3 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        {selectedRows} of {filteredRows} row(s) selected.
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        {showPageSize ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rows
            </span>
            <select
              value={String(pageSize)}
              onChange={(event) => table.setPageSize?.(Number(event.target.value))}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300 dark:border-white/10 dark:bg-deep-charcoal dark:text-slate-200 dark:focus:ring-slate-600"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Page {pageIndex + 1} of {Math.max(pageCount, 1)}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-deep-charcoal">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10"
            onClick={() => table.setPageIndex?.(0)}
            disabled={!table.getCanPreviousPage?.()}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10"
            onClick={() => table.previousPage?.()}
            disabled={!table.getCanPreviousPage?.()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10"
            onClick={() => table.nextPage?.()}
            disabled={!table.getCanNextPage?.()}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10"
            onClick={() => table.setPageIndex?.(Math.max(pageCount - 1, 0))}
            disabled={!table.getCanNextPage?.()}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { DataTablePagination }
