import { Button } from "@shared/components/ui/Button";
import { Input } from "@shared/components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/Popover";
import { Separator } from "@shared/components/ui/Separator";
import type { Column } from "@tanstack/react-table";
import { PlusCircleIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useDataTableReactive } from "./DataTableContext";

interface DataTableRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}

/**
 * Range filter with min/max number inputs.
 * Sets filter value as [min, max] tuple.
 */
function DataTableRangeFilter<TData, TValue>({
  column,
  title,
  min = 0,
  max = 999999,
  step = 1,
  prefix = "",
}: DataTableRangeFilterProps<TData, TValue>) {
  const filterValue = column?.getFilterValue() as [number, number] | undefined;
  const [localMin, setLocalMin] = useState<string>(filterValue?.[0]?.toString() ?? "");
  const [localMax, setLocalMax] = useState<string>(filterValue?.[1]?.toString() ?? "");

  // Sync from external changes without useEffect — derived state during render
  const prevFilterRef = useRef(filterValue);
  if (
    prevFilterRef.current?.[0] !== filterValue?.[0] ||
    prevFilterRef.current?.[1] !== filterValue?.[1]
  ) {
    prevFilterRef.current = filterValue;
    setLocalMin(filterValue?.[0]?.toString() ?? "");
    setLocalMax(filterValue?.[1]?.toString() ?? "");
  }

  const hasValue = filterValue != null;
  const displayLabel = hasValue
    ? `${prefix}${filterValue[0] ?? min} – ${prefix}${filterValue[1] ?? max}`
    : null;

  const applyFilter = () => {
    const minVal = localMin ? Number(localMin) : undefined;
    const maxVal = localMax ? Number(localMax) : undefined;

    if (minVal == null && maxVal == null) {
      column?.setFilterValue(undefined);
    } else {
      column?.setFilterValue([minVal ?? min, maxVal ?? max]);
    }
  };

  const clearFilter = () => {
    setLocalMin("");
    setLocalMax("");
    column?.setFilterValue(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <PlusCircleIcon className="size-4" />
          {title}
          {displayLabel && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span className="text-xs font-normal tabular-nums">{displayLabel}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3 p-3" align="start">
        <p className="text-muted-foreground text-xs font-medium">{title} range</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`Min`}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            min={min}
            max={max}
            step={step}
            className="h-8 text-sm"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="number"
            placeholder={`Max`}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            min={min}
            max={max}
            step={step}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-7 flex-1 text-xs" onClick={applyFilter}>
            Apply
          </Button>
          {hasValue && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilter}>
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---- Compound wrapper ----

function CompoundRangeFilter({
  column: columnId,
  ...props
}: {
  column: string;
  title: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}) {
  const { table } = useDataTableReactive();
  const column = table.getColumn(columnId);
  if (!column) {
    return null;
  }
  return <DataTableRangeFilter column={column} {...props} />;
}

export type { DataTableRangeFilterProps };
export { CompoundRangeFilter, DataTableRangeFilter };
