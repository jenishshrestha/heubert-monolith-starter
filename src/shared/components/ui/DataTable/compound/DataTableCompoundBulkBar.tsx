import { DataTableBulkBar } from "../DataTableBulkBar";
import { useDataTableReactive } from "./DataTableContext";

interface CompoundBulkBarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Context-aware bulk action bar. Reads from ReactiveContext —
 * re-renders on table state changes (needed for selection count).
 */
function DataTableCompoundBulkBar({ children, className }: CompoundBulkBarProps) {
  const { table } = useDataTableReactive();

  return (
    <DataTableBulkBar table={table} className={className}>
      {children}
    </DataTableBulkBar>
  );
}

export type { CompoundBulkBarProps };
export { DataTableCompoundBulkBar };
