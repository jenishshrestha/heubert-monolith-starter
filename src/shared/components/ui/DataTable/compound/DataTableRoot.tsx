import { useDataTable } from "@shared/lib/data-table";
import type { DataTableConfig } from "@shared/lib/data-table/data-table.types";
import { useMemo } from "react";
import { ReactiveCtx, SearchCtx, StableCtx, ViewCtx } from "./DataTableContext";

interface DataTableRootProps<TData> {
  config: DataTableConfig<TData>;
  children: React.ReactNode;
  className?: string;
}

function DataTableRoot<TData>({ config, children, className }: DataTableRootProps<TData>) {
  const result = useDataTable(config);

  // Stable: table ref, config, callbacks — these references rarely change.
  // Consumers: CompoundFilter (table.getColumn), CompoundViewOptions (table.getAllColumns)
  const stableValue = useMemo(
    () => ({
      table: result.table,
      config,
      setGlobalFilter: result.setGlobalFilter,
      setView: result.setView,
      availableViews: result.availableViews,
    }),
    [result.table, config, result.setGlobalFilter, result.setView, result.availableViews],
  );

  // Search: only the globalFilter string.
  // Consumers: CompoundSearch
  const searchValue = useMemo(() => ({ globalFilter: result.globalFilter }), [result.globalFilter]);

  // View: only the view mode string.
  // Consumers: CompoundViewToggle, DataTableContent
  const viewValue = useMemo(() => ({ view: result.view }), [result.view]);

  // Reactive: everything that changes on table state mutation (row selection, sort, fetch, pagination).
  // NOT memoized — this intentionally updates on every DataTableRoot render so that
  // table-rendering components (DataTable rows, BulkBar, Pagination) pick up new state.
  // Consumers: DataTableContent, CompoundPagination, CompoundBulkBar
  const reactiveValue = {
    table: result.table,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isEmpty: result.isEmpty,
    data: result.data,
    totalRows: result.totalRows,
    hasNextPage: result.hasNextPage,
    hasPreviousPage: result.hasPreviousPage,
  };

  return (
    <StableCtx.Provider value={stableValue}>
      <SearchCtx.Provider value={searchValue}>
        <ViewCtx.Provider value={viewValue}>
          <ReactiveCtx.Provider value={reactiveValue}>
            <div className={className}>{children}</div>
          </ReactiveCtx.Provider>
        </ViewCtx.Provider>
      </SearchCtx.Provider>
    </StableCtx.Provider>
  );
}

export type { DataTableRootProps };
export { DataTableRoot };
