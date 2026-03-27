import { useNavigate, useSearch } from "@tanstack/react-router";
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useCallback, useMemo } from "react";

interface UseDataTableSearchParamsOptions {
  defaultPageSize?: number;
  prefix?: string;
}

export interface UseDataTableSearchParamsReturn {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  setPagination: OnChangeFn<PaginationState>;
  setSorting: OnChangeFn<SortingState>;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  setGlobalFilter: (value: string) => void;
}

function parseSortParam(sort?: string): SortingState {
  if (!sort) return [];
  const [id, dir] = sort.split(".");
  if (!id) return [];
  return [{ id, desc: dir === "desc" }];
}

function serializeSortState(sorting: SortingState): string | undefined {
  const first = sorting[0];
  if (!first) return undefined;
  return `${first.id}.${first.desc ? "desc" : "asc"}`;
}

function parseFiltersParam(filters?: string): ColumnFiltersState {
  if (!filters) return [];
  try {
    return JSON.parse(filters) as ColumnFiltersState;
  } catch {
    return [];
  }
}

function serializeFiltersState(filters: ColumnFiltersState): string | undefined {
  if (filters.length === 0) return undefined;
  return JSON.stringify(filters);
}

export function useDataTableSearchParams(
  options: UseDataTableSearchParamsOptions = {},
): UseDataTableSearchParamsReturn {
  const { defaultPageSize = 10 } = options;
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: typeof search.page === "number" ? search.page : 0,
      pageSize: typeof search.pageSize === "number" ? search.pageSize : defaultPageSize,
    }),
    [search.page, search.pageSize, defaultPageSize],
  );

  const sorting: SortingState = useMemo(
    () => parseSortParam(search.sort as string | undefined),
    [search.sort],
  );

  const columnFilters: ColumnFiltersState = useMemo(
    () => parseFiltersParam(search.filters as string | undefined),
    [search.filters],
  );

  const globalFilter = (search.search as string) ?? "";

  const setPagination: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      void navigate({
        search: ((prev: Record<string, unknown>) => ({
          ...prev,
          page: next.pageIndex === 0 ? undefined : next.pageIndex,
          pageSize: next.pageSize === defaultPageSize ? undefined : next.pageSize,
        })) as never,
        replace: true,
      });
    },
    [pagination, navigate, defaultPageSize],
  );

  const setSorting: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      void navigate({
        search: ((prev: Record<string, unknown>) => ({
          ...prev,
          sort: serializeSortState(next),
          page: undefined,
        })) as never,
        replace: true,
      });
    },
    [sorting, navigate],
  );

  const setColumnFilters: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const next = typeof updater === "function" ? updater(columnFilters) : updater;
      void navigate({
        search: ((prev: Record<string, unknown>) => ({
          ...prev,
          filters: serializeFiltersState(next),
          page: undefined,
        })) as never,
        replace: true,
      });
    },
    [columnFilters, navigate],
  );

  const setGlobalFilter = useCallback(
    (value: string) => {
      void navigate({
        search: ((prev: Record<string, unknown>) => ({
          ...prev,
          search: value || undefined,
          page: undefined,
        })) as never,
        replace: true,
      });
    },
    [navigate],
  );

  return {
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    setPagination,
    setSorting,
    setColumnFilters,
    setGlobalFilter,
  };
}
