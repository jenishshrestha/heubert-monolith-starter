import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";
import type { AdvancedFilterState } from "./useAdvancedFilters";
import type { ResolvedDataSource } from "./useDataSource";
import { noopQueryFn } from "./useDataSource";
import { useDataTableQuery } from "./useDataTableQuery";

interface UseServerDataOptions<TData> {
  dataSource: ResolvedDataSource<TData>;
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  advancedFilters?: AdvancedFilterState;
}

export interface UseServerDataReturn<TData> {
  data: TData[];
  totalRows: number;
  isLoading: boolean;
  isFetching: boolean;
  pageCount: number | undefined;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useServerData<TData>(
  options: UseServerDataOptions<TData>,
): UseServerDataReturn<TData> {
  const { dataSource, pagination, sorting, columnFilters, globalFilter, advancedFilters } = options;
  const isServer = dataSource.mode === "server";

  const serverQuery = useDataTableQuery({
    enabled: isServer,
    queryKey: isServer ? dataSource.queryKey : ["__noop__"],
    queryFn: isServer ? dataSource.queryFn : noopQueryFn,
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    advancedFilters,
  });

  const data: TData[] = isServer ? serverQuery.data : dataSource.data;
  const totalRows = isServer ? serverQuery.total : dataSource.data.length;
  const isLoading = isServer ? serverQuery.isLoading : false;
  const isFetching = isServer ? serverQuery.isFetching : false;

  const hasNextPage = isServer
    ? dataSource.isCursorMode
      ? serverQuery.nextCursor !== null
      : pagination.pageIndex < Math.ceil(totalRows / pagination.pageSize) - 1
    : false;

  const hasPreviousPage = dataSource.isCursorMode
    ? serverQuery.previousCursor !== null
    : pagination.pageIndex > 0;

  const pageCount = isServer
    ? (serverQuery.pageCount ?? Math.ceil(totalRows / pagination.pageSize))
    : undefined;

  return {
    data,
    totalRows,
    isLoading,
    isFetching,
    pageCount,
    hasNextPage,
    hasPreviousPage,
  };
}
