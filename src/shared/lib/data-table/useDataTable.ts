import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDataTableAdapter } from "./DataTableProvider";
import type { DataTableConfig, DataTableView, UseDataTableReturn } from "./data-table.types";
import { useDataProvider } from "./provider/DataProviderRegistry";
import { resolveProviderDataSource } from "./provider/resolveProviderDataSource";
import { resolveDataSource } from "./resolveDataSource";
import { useDataTableQuery } from "./useDataTableQuery";
import { useDataTableSearchParams } from "./useDataTableSearchParams";

// Noop queryFn for client mode — never called due to enabled: false
const noopQueryFn = () => Promise.resolve({ data: [] as never[], total: 0 });

export function useDataTable<TData>(config: DataTableConfig<TData>): UseDataTableReturn<TData> {
  const {
    columns = [],
    cardRenderer,
    dataSource: rawDataSource,
    pagination: paginationConfig,
    enableSorting = true,
    enableRowSelection = false,
    enableMultiSort = false,
    syncWithUrl = true,
  } = config;

  // ---- View state ----

  const availableViews = useMemo<DataTableView[]>(() => {
    if (columns.length > 0 && cardRenderer) return ["table", "card"];
    if (cardRenderer) return ["card"];
    return ["table"];
  }, [columns.length, cardRenderer]);

  const defaultView = config.defaultView ?? availableViews[0]!;
  const [view, setView] = useState<DataTableView>(defaultView);

  // ---- Cursor map for cursor-based pagination ----

  const cursorMapRef = useRef(new Map<number, string>());

  // ---- Resolve data source ----

  const contextAdapter = useDataTableAdapter();
  const contextProvider = useDataProvider();

  const dataSource = useMemo(() => {
    if (rawDataSource.mode === "provider") {
      const provider = rawDataSource.provider ?? contextProvider;
      if (!provider) {
        throw new Error(
          "DataTable: mode is 'provider' but no DataProvider found. " +
            "Either pass `provider` in dataSource config or wrap your app with <DataProviderRegistry>.",
        );
      }
      return resolveProviderDataSource<TData>(
        {
          resource: rawDataSource.resource,
          provider,
          paginationType: rawDataSource.paginationType ?? "offset",
          queryKey: rawDataSource.queryKey ?? [rawDataSource.resource],
          meta: rawDataSource.meta,
        },
        cursorMapRef.current,
      );
    }
    return resolveDataSource(rawDataSource, contextAdapter);
  }, [rawDataSource, contextAdapter, contextProvider]);

  const isServer = dataSource.mode === "server";
  const defaultPageSize = paginationConfig?.defaultPageSize ?? 10;

  // ---- State management (URL-synced or local) ----

  const urlState = useDataTableSearchParams({
    defaultPageSize,
    prefix: config.urlParamPrefix,
  });

  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<ColumnFiltersState>([]);
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");

  const pagination = syncWithUrl ? urlState.pagination : localPagination;
  const sorting = syncWithUrl ? urlState.sorting : localSorting;
  const columnFilters = syncWithUrl ? urlState.columnFilters : localFilters;
  const globalFilter = syncWithUrl ? urlState.globalFilter : localGlobalFilter;

  const setPagination = syncWithUrl ? urlState.setPagination : setLocalPagination;

  // Local setters wrapped in useCallback for stable references (fixes search debounce).
  // URL-synced setters are already stable (from useCallback in useDataTableSearchParams).
  // Both reset to page 0 when filters/search/sort change.
  const localSetSorting = useCallback<OnChangeFn<SortingState>>((updater) => {
    setLocalSorting(updater);
    setLocalPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const localSetColumnFilters = useCallback<OnChangeFn<ColumnFiltersState>>((updater) => {
    setLocalFilters(updater);
    setLocalPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const localSetGlobalFilter = useCallback((value: string) => {
    setLocalGlobalFilter(value);
    setLocalPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const setSorting = syncWithUrl ? urlState.setSorting : localSetSorting;
  const setColumnFilters = syncWithUrl ? urlState.setColumnFilters : localSetColumnFilters;
  const setGlobalFilter = syncWithUrl ? urlState.setGlobalFilter : localSetGlobalFilter;

  // ---- Column visibility & row selection (always local) ----

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const initial: VisibilityState = {};
    for (const col of columns) {
      if (col.meta?.hiddenByDefault && "id" in col && col.id) {
        initial[col.id] = false;
      }
    }
    return initial;
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // ---- Server-side data fetching (always called, disabled for client mode) ----

  const serverQuery = useDataTableQuery({
    enabled: isServer,
    queryKey: isServer ? dataSource.queryKey : ["__noop__"],
    queryFn: isServer ? dataSource.queryFn : noopQueryFn,
    pagination,
    sorting,
    columnFilters,
    globalFilter,
  });

  const data: TData[] = isServer ? serverQuery.data : dataSource.data;
  const totalRows = isServer ? serverQuery.total : dataSource.data.length;
  const isLoading = isServer ? serverQuery.isLoading : false;
  const isFetching = isServer ? serverQuery.isFetching : false;
  const isCursorMode =
    rawDataSource.mode === "provider" && rawDataSource.paginationType === "cursor";
  const hasNextPage = isServer
    ? isCursorMode
      ? serverQuery.nextCursor !== null
      : pagination.pageIndex < Math.ceil(totalRows / pagination.pageSize) - 1
    : false;
  const hasPreviousPage = isCursorMode
    ? serverQuery.previousCursor !== null
    : pagination.pageIndex > 0;

  // ---- TanStack Table instance ----

  const pageCount = isServer
    ? (serverQuery.pageCount ?? Math.ceil(totalRows / pagination.pageSize))
    : undefined;

  const table = useReactTable<TData>({
    data,
    columns: columns as ColumnDef<TData, unknown>[],
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },

    // State handlers
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    // Row models
    getCoreRowModel: getCoreRowModel(),
    ...(isServer
      ? {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          pageCount,
          rowCount: totalRows,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getFacetedRowModel: getFacetedRowModel(),
          getFacetedUniqueValues: getFacetedUniqueValues(),
        }),

    // Feature flags
    enableSorting,
    enableMultiSort,
    enableRowSelection:
      typeof enableRowSelection === "function"
        ? (row) => enableRowSelection(row.original)
        : enableRowSelection,
  });

  const isEmpty = !isLoading && data.length === 0;

  return useMemo(
    () => ({
      table,
      isLoading,
      isFetching,
      isEmpty,
      data,
      totalRows,
      globalFilter,
      setGlobalFilter,
      view,
      setView,
      availableViews,
      hasNextPage,
      hasPreviousPage,
    }),
    [
      table,
      isLoading,
      isFetching,
      isEmpty,
      data,
      totalRows,
      globalFilter,
      setGlobalFilter,
      view,
      setView,
      availableViews,
      hasNextPage,
      hasPreviousPage,
    ],
  );
}
