import { Button } from "@shared/components/ui/Button";
import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { DataTableSearch } from "./DataTableSearch";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
}

function DataTableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder,
  filterSlot,
  actionSlot,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || (globalFilter != null && globalFilter.length > 0);

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        {onGlobalFilterChange && (
          <DataTableSearch
            value={globalFilter ?? ""}
            onChange={onGlobalFilterChange}
            placeholder={searchPlaceholder}
          />
        )}
        {filterSlot}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              onGlobalFilterChange?.("");
            }}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && actionSlot}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

export type { DataTableToolbarProps };
export { DataTableToolbar };
