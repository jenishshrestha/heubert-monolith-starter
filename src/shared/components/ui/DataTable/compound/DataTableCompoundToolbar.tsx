import { Button } from "@shared/components/ui/Button";
import { XIcon } from "lucide-react";
import { useCallback } from "react";
import { useDataTableInstance, useDataTableReactive, useDataTableSearch } from "./DataTableContext";

interface DataTableCompoundToolbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Context-aware toolbar. Reads from ReactiveCtx (for filter state),
 * StableCtx (for reset actions), and SearchCtx (for search state).
 */
function DataTableCompoundToolbar({ children, className }: DataTableCompoundToolbarProps) {
  const { setGlobalFilter } = useDataTableInstance();
  const { globalFilter } = useDataTableSearch();
  const { table } = useDataTableReactive();

  const isFiltered =
    table.getState().columnFilters.length > 0 || (globalFilter != null && globalFilter.length > 0);

  const handleReset = useCallback(() => {
    table.resetColumnFilters();
    setGlobalFilter("");
  }, [table, setGlobalFilter]);

  return (
    <div className={className ?? "flex items-center justify-between gap-2"}>
      <div className="flex flex-1 items-center gap-2">
        {children}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-2 lg:px-3">
            Reset
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export type { DataTableCompoundToolbarProps };
export { DataTableCompoundToolbar };
