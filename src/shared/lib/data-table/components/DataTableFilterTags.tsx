import { Button } from "@shared/components/ui/Button";
import type { Table } from "@tanstack/react-table";
import { RotateCcwIcon, XIcon } from "lucide-react";
import type { DataTableColumnFilterConfig, DataTableFilterOption } from "../types/data-table.types";
import { useDataTableReactive } from "./DataTableContext";

interface DataTableFilterTagsProps<TData> {
  table: Table<TData>;
}

function formatFilterValue(value: unknown, options?: DataTableFilterOption[]): string {
  // Array value (multi-select or single-select wrapped in array)
  if (Array.isArray(value)) {
    if (options) {
      return value
        .map((v) => options.find((o) => o.value === String(v))?.label ?? String(v))
        .join(", ");
    }
    return value.map(String).join(", ");
  }

  // Range tuple [min, max]
  if (typeof value === "object" && value !== null) {
    return String(value);
  }

  // Primitive
  return String(value);
}

/**
 * Displays active column filters as removable tags/chips.
 * Shows column name and the selected value(s).
 */
function DataTableFilterTags<TData>({ table }: DataTableFilterTagsProps<TData>) {
  const columnFilters = table.getState().columnFilters;

  if (columnFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs font-medium">Filter by:</span>
      {columnFilters.map((filter) => {
        const column = table.getColumn(filter.id);
        const meta = column?.columnDef.meta as
          | { label?: string; filter?: DataTableColumnFilterConfig }
          | undefined;
        const label = meta?.label ?? filter.id;
        const options = Array.isArray(meta?.filter?.options) ? meta.filter.options : undefined;
        const valueDisplay = formatFilterValue(filter.value, options);

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => column?.setFilterValue(undefined)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors"
          >
            <span className="font-medium">{label}:</span>
            <span className="max-w-40 truncate">{valueDisplay}</span>
            <XIcon className="size-3 shrink-0" />
          </button>
        );
      })}
      {columnFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.resetColumnFilters()}
          className="text-muted-foreground h-auto px-2 py-1 text-xs"
        >
          <RotateCcwIcon className="size-3" />
          Reset
        </Button>
      )}
    </div>
  );
}

// ---- Compound wrapper ----

function CompoundFilterTags() {
  const { table } = useDataTableReactive();
  return <DataTableFilterTags table={table} />;
}

export type { DataTableFilterTagsProps };
export { CompoundFilterTags, DataTableFilterTags };
