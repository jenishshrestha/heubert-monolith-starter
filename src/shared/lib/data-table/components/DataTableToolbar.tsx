import { Button } from "@shared/components/ui/Button";
import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { DataTableAdvancedFilter } from "./DataTableAdvancedFilter";
import { useDataTableInstance, useDataTableReactive, useDataTableSearch } from "./DataTableContext";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { DataTableRangeFilter } from "./DataTableRangeFilter";
import { DataTableSearch } from "./DataTableSearch";
import { DataTableSingleFilter } from "./DataTableSingleFilter";
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

// ---- Compound wrapper ----

function CompoundToolbar({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  if (children) {
    return <div className={className ?? "flex items-center gap-2"}>{children}</div>;
  }
  return <AutoToolbar className={className} />;
}

function AutoToolbar({ className }: { className?: string }) {
  const { config, setGlobalFilter } = useDataTableInstance();
  const { globalFilter } = useDataTableSearch();
  const { table } = useDataTableReactive();

  const toolbar = config.toolbar;
  if (!toolbar) {
    return null;
  }

  const hasRightSide = toolbar.advancedFilter || toolbar.columnToggle;

  return (
    <div className={className ?? "flex items-center justify-between gap-2"}>
      <div className="flex flex-1 items-center gap-2">
        {toolbar.search && (
          <DataTableSearch
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder={toolbar.search.placeholder}
            debounceMs={toolbar.search.debounceMs}
          />
        )}

        {toolbar.filters?.map((filter) => {
          const column = table.getColumn(filter.column);
          if (!column) {
            return null;
          }

          const label =
            (column.columnDef.meta as { label?: string } | undefined)?.label ?? filter.column;

          switch (filter.type) {
            case "text":
              return null;
            case "select":
            case "multi-select":
              return (
                <DataTableFacetedFilter
                  key={filter.column}
                  column={column}
                  title={label}
                  options={filter.options}
                />
              );
            case "single-select":
              return (
                <DataTableSingleFilter
                  key={filter.column}
                  column={column}
                  title={label}
                  options={filter.options}
                />
              );
            case "range":
              return (
                <DataTableRangeFilter
                  key={filter.column}
                  column={column}
                  title={label}
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  prefix={filter.prefix}
                />
              );
            default:
              return null;
          }
        })}
      </div>

      {hasRightSide && (
        <div className="flex items-center gap-2">
          {toolbar.advancedFilter && <DataTableAdvancedFilter table={table} />}
          {toolbar.columnToggle && <DataTableViewOptions table={table} />}
        </div>
      )}
    </div>
  );
}

export type { DataTableToolbarProps };
export { CompoundToolbar, DataTableToolbar };
