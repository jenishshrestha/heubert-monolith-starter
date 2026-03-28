import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Checkbox } from "@shared/components/ui/Checkbox";
import { Input } from "@shared/components/ui/Input";
import { Label } from "@shared/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/Select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/components/ui/Sheet";
import type { Column, Table } from "@tanstack/react-table";
import { ListFilterIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { DataTableColumnFilterConfig, DataTableFilterOption } from "../types/data-table.types";
import { useDataTableReactive } from "./DataTableContext";

// ---- Types ----

interface FilterableColumn {
  id: string;
  label: string;
  filterConfig?: DataTableColumnFilterConfig;
  column: Column<unknown, unknown>;
}

interface DataTableAdvancedFilterProps<TData> {
  table: Table<TData>;
}

// ---- Per-type filter inputs ----

function TextFilterInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type to filter..."
      className="h-8 text-sm"
    />
  );
}

function SelectFilterInput({
  value,
  options,
  onChange,
}: {
  value: string;
  options: DataTableFilterOption[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-sm">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiSelectFilterInput({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: DataTableFilterOption[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <div className="space-y-1.5">
      {options.map((opt) => {
        const id = `filter-${opt.value}`;
        return (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={value.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
            <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
              {opt.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}

function RangeFilterInput({
  value,
  onChange,
}: {
  value: [string, string];
  onChange: (v: [string, string]) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value[0]}
        onChange={(e) => onChange([e.target.value, value[1]])}
        placeholder="Min"
        className="h-8 text-sm"
      />
      <span className="text-muted-foreground text-xs">–</span>
      <Input
        type="number"
        value={value[1]}
        onChange={(e) => onChange([value[0], e.target.value])}
        placeholder="Max"
        className="h-8 text-sm"
      />
    </div>
  );
}

// ---- Main Component ----

type LocalFilterState = Record<string, unknown>;

function DataTableAdvancedFilter<TData>({ table }: DataTableAdvancedFilterProps<TData>) {
  const [open, setOpen] = useState(false);

  // Detect filterable columns from table
  const filterableColumns: FilterableColumn[] = (table as Table<unknown>)
    .getAllColumns()
    .filter((col) => {
      if (col.id === "select" || col.id === "actions") {
        return false;
      }
      const meta = col.columnDef.meta as { filter?: DataTableColumnFilterConfig } | undefined;
      return meta?.filter != null;
    })
    .map((col) => {
      const meta = col.columnDef.meta as { label?: string; filter?: DataTableColumnFilterConfig };
      return {
        id: col.id,
        label: meta?.label ?? col.id,
        filterConfig: meta?.filter,
        column: col,
      };
    });

  // Local filter state — snapshot from table on open, applied on "Apply"
  const [localState, setLocalState] = useState<LocalFilterState>({});

  // Snapshot table filters when sheet opens — derived state during render
  const prevOpenRef = useRef(false);
  if (open && !prevOpenRef.current) {
    const state: LocalFilterState = {};
    for (const filter of table.getState().columnFilters) {
      state[filter.id] = filter.value;
    }
    setLocalState(state);
  }
  prevOpenRef.current = open;

  const activeFilterCount = table.getState().columnFilters.length;

  const updateLocal = useCallback((columnId: string, value: unknown) => {
    setLocalState((prev) => {
      const next = { ...prev };
      if (value === "" || value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete next[columnId];
      } else {
        next[columnId] = value;
      }
      return next;
    });
  }, []);

  const applyFilters = useCallback(() => {
    // Clear all, then set each
    table.resetColumnFilters();
    for (const [columnId, value] of Object.entries(localState)) {
      const column = table.getColumn(columnId);
      if (column && value != null) {
        column.setFilterValue(value);
      }
    }
    setOpen(false);
  }, [localState, table]);

  const clearAll = useCallback(() => {
    setLocalState({});
    table.resetColumnFilters();
    setOpen(false);
  }, [table]);

  if (filterableColumns.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <ListFilterIcon className="size-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge className="ml-1 size-5 rounded-full p-0 text-xs">{activeFilterCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-96 flex-col sm:w-lg">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Set filters to narrow down results.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto py-4">
          {filterableColumns.map((col) => {
            const config = col.filterConfig;
            if (!config) {
              return null;
            }
            const options = Array.isArray(config.options) ? config.options : [];

            return (
              <div key={col.id} className="space-y-1.5">
                <Label className="text-sm font-medium">{col.label}</Label>

                {config.type === "text" && (
                  <TextFilterInput
                    value={(localState[col.id] as string) ?? ""}
                    onChange={(v) => updateLocal(col.id, v)}
                  />
                )}

                {config.type === "select" && (
                  <SelectFilterInput
                    value={(localState[col.id] as string) ?? ""}
                    options={options}
                    onChange={(v) => updateLocal(col.id, [v])}
                  />
                )}

                {config.type === "multi-select" && (
                  <MultiSelectFilterInput
                    value={(localState[col.id] as string[]) ?? []}
                    options={options}
                    onChange={(v) => updateLocal(col.id, v)}
                  />
                )}

                {config.type === "date-range" && (
                  <RangeFilterInput
                    value={(localState[col.id] as [string, string]) ?? ["", ""]}
                    onChange={(v) => {
                      const min = v[0] ? Number(v[0]) : undefined;
                      const max = v[1] ? Number(v[1]) : undefined;
                      if (min == null && max == null) {
                        updateLocal(col.id, undefined);
                      } else {
                        updateLocal(col.id, [min ?? 0, max ?? 999999]);
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <SheetFooter className="flex-row gap-2 border-t pt-4">
          {Object.keys(localState).length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Reset
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </SheetClose>
          <Button size="sm" onClick={applyFilters}>
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ---- Compound wrapper ----

function CompoundAdvancedFilter() {
  const { table } = useDataTableReactive();
  return <DataTableAdvancedFilter table={table} />;
}

export type { DataTableAdvancedFilterProps };
export { CompoundAdvancedFilter, DataTableAdvancedFilter };
