import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo } from "react";
import type { DataTableQueryParams, DataTableServerResponse } from "../types/data-table.types";

interface UseDataTableQueryOptions<TData> {
  enabled: boolean;
  queryKey: readonly unknown[];
  queryFn: (params: DataTableQueryParams) => Promise<DataTableServerResponse<TData>>;
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
}

export function useDataTableQuery<TData>(options: UseDataTableQueryOptions<TData>) {
  const { queryKey, queryFn, pagination, sorting, columnFilters, globalFilter } = options;

  // Memoize params so React Query sees a stable queryKey.
  // Without this, .map() creates new arrays every render → cache misses.
  const params: DataTableQueryParams = useMemo(
    () => ({
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
      filters: columnFilters.map((f) => ({ id: f.id, value: f.value })),
      search: globalFilter || undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, sorting, columnFilters, globalFilter],
  );

  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });

  const result = query.data as
    | (DataTableServerResponse<TData> & {
        nextCursor?: string | null;
        previousCursor?: string | null;
      })
    | undefined;

  return {
    data: result?.data ?? [],
    total: result?.total ?? 0,
    pageCount: result?.pageCount,
    nextCursor: result?.nextCursor ?? null,
    previousCursor: result?.previousCursor ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
