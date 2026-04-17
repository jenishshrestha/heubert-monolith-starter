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

interface DataTableContentProps<TData = unknown> {
  /** Override the default rendering with a render prop. */
  children?: (ctx: DataTableContextValue<TData>) => React.ReactNode;
  /** Override skeleton row count. Defaults to current pageSize. */
  skeletonRows?: number;
  /** Custom empty state title. */
  emptyTitle?: string;
  /** Custom empty state description. */
  emptyDescription?: string;
  className?: string;
}

function DataTableContent<TData>({
  children,
  skeletonRows,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your filters.",
  className,
}: DataTableContentProps<TData>) {
  const ctx = useDataTableContext<TData>();
  const { config } = useDataTableInstance<TData>();
  const { table, isLoading, isFetching, isEmpty } = useDataTableReactive<TData>();
  const { view } = useDataTableView();

  if (children) {
    return <>{children(ctx)}</>;
  }

  const loading = isLoading || isFetching;
  const effectiveSkeletonRows = skeletonRows ?? table.getState().pagination.pageSize;

  if (!loading && isEmpty) {
    return <DataTableEmpty title={emptyTitle} description={emptyDescription} />;
  }

  if (view === "card" && config.cardRenderer) {
    return (
      <DataTableCardGrid
        table={table}
        cardRenderer={config.cardRenderer}
        isFetching={loading}
        skeletonCount={effectiveSkeletonRows}
        className={className}
      />
    );
  }

  return (
    <DataTable
      table={table}
      isFetching={loading}
      skeletonRows={effectiveSkeletonRows}
      className={className}
    />
  );
}

export type { DataTableContentProps };
export { DataTableContent };
