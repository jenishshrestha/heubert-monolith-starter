import { DataTable } from "./DataTable";
import { DataTableCardGrid } from "./DataTableCardGrid";
import {
  type DataTableContextValue,
  useDataTableContext,
  useDataTableInstance,
  useDataTableReactive,
  useDataTableView,
} from "./DataTableContext";
import { DataTableEmpty } from "./DataTableEmpty";
import { DataTableSkeleton } from "./DataTableSkeleton";

interface DataTableContentProps<TData = unknown> {
  /** Override the default rendering with a render prop. */
  children?: (ctx: DataTableContextValue<TData>) => React.ReactNode;
  /** Number of skeleton columns (defaults to column count + 1). */
  skeletonColumns?: number;
  /** Number of skeleton rows (defaults to 10). */
  skeletonRows?: number;
  /** Custom empty state title. */
  emptyTitle?: string;
  /** Custom empty state description. */
  emptyDescription?: string;
  className?: string;
}

function DataTableContent<TData>({
  children,
  skeletonColumns,
  skeletonRows = 10,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your filters.",
  className,
}: DataTableContentProps<TData>) {
  // All hooks must be called unconditionally
  const ctx = useDataTableContext<TData>();
  const { config } = useDataTableInstance<TData>();
  const { table, isLoading, isFetching, isEmpty } = useDataTableReactive<TData>();
  const { view } = useDataTableView();

  // Render prop escape hatch
  if (children) {
    return <>{children(ctx)}</>;
  }

  const columnCount = skeletonColumns ?? (config.columns?.length ?? 3) + 1;

  if (isLoading) {
    return <DataTableSkeleton columnCount={columnCount} rowCount={skeletonRows} />;
  }

  if (isEmpty) {
    return <DataTableEmpty title={emptyTitle} description={emptyDescription} />;
  }

  if (view === "card" && config.cardRenderer) {
    return (
      <DataTableCardGrid
        table={table}
        cardRenderer={config.cardRenderer}
        isFetching={isFetching}
        className={className}
      />
    );
  }

  return <DataTable table={table} isFetching={isFetching} className={className} />;
}

export type { DataTableContentProps };
export { DataTableContent };
