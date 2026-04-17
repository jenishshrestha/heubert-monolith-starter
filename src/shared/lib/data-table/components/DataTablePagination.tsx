import { Button } from "@shared/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/Select";
import type { Table } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useDataTableInstance, useDataTableReactive } from "./DataTableContext";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | "ellipsis")[] = [0];

  if (currentPage > 2) {
    pages.push("ellipsis");
  }

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 3) {
    pages.push("ellipsis");
  }

  pages.push(totalPages - 1);

  return pages;
}

function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalPages = table.getPageCount();
  const totalRows = table.getRowCount();
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const from = totalRows === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min(from + table.getRowModel().rows.length - 1, totalRows);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 px-2 py-4">
      <span className="text-sm tabular-nums text-foreground">
        {totalRows > 0 ? `${from}-${to} of ${totalRows} items` : "No records"}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="size-4" />
            Previous
          </Button>

          {pageNumbers.map((page, i) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${String(i)}`} className="text-muted-foreground px-2 text-sm">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "outline" : "ghost"}
                size="icon"
                onClick={() => table.setPageIndex(page)}
              >
                {page + 1}
              </Button>
            ),
          )}

          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}

      <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
        <SelectTrigger className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top">
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={`${size}`}>
              {size} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ---- Compound wrapper ----

function CompoundPagination({ pageSizeOptions }: { pageSizeOptions?: number[] }) {
  const { table } = useDataTableReactive();
  const { config } = useDataTableInstance();
  return (
    <DataTablePagination
      table={table}
      pageSizeOptions={pageSizeOptions ?? config.pagination?.pageSizeOptions}
    />
  );
}

export type { DataTablePaginationProps };
export { CompoundPagination, DataTablePagination };
