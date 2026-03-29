import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useRouterAdapter } from "../router/RouterAdapterProvider";
import type { RouterAdapter } from "../router/router-adapter.types";
import { useUrlSyncedState } from "../router/useUrlSyncedState";

interface UseTableStateOptions {
  syncWithUrl: boolean;
  defaultPageSize: number;
  urlParamPrefix?: string;
}

export interface UseTableStateReturn {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  setPagination: OnChangeFn<PaginationState>;
  setSorting: OnChangeFn<SortingState>;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  setGlobalFilter: (value: string) => void;
}

/** Noop adapter — satisfies React hooks rules when URL sync is off or no adapter provided */
const noopAdapter: RouterAdapter = {
  useSearchParams: () => ({
    getParams: () => ({}),
    setParams: () => {},
  }),
};

export function useTableState(options: UseTableStateOptions): UseTableStateReturn {
  const { syncWithUrl, defaultPageSize, urlParamPrefix } = options;

  const routerAdapter = useRouterAdapter();

  // URL-synced state (always called with noop fallback — React rules of hooks)
  const urlState = useUrlSyncedState(routerAdapter ?? noopAdapter, {
    defaultPageSize,
    prefix: urlParamPrefix,
  });

  // Local state
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<ColumnFiltersState>([]);
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");

  const resetPageIndex = useCallback(
    () => setLocalPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 })),
    [],
  );

  // Local setters that reset page to 0 on sort/filter/search change
  const localSetSorting = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      setLocalSorting(updater);
      resetPageIndex();
    },
    [resetPageIndex],
  );

  const localSetColumnFilters = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      setLocalFilters(updater);
      resetPageIndex();
    },
    [resetPageIndex],
  );

  const localSetGlobalFilter = useCallback(
    (value: string) => {
      setLocalGlobalFilter(value);
      resetPageIndex();
    },
    [resetPageIndex],
  );

  // Select based on syncWithUrl flag
  if (syncWithUrl) {
    if (!routerAdapter) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "DataTable: syncWithUrl is true but no RouterAdapter provided. " +
            "Wrap your app with <RouterAdapterProvider adapter={...}>. Falling back to local state.",
        );
      }
    } else {
      return urlState;
    }
  }

  return {
    pagination: localPagination,
    sorting: localSorting,
    columnFilters: localFilters,
    globalFilter: localGlobalFilter,
    setPagination: setLocalPagination,
    setSorting: localSetSorting,
    setColumnFilters: localSetColumnFilters,
    setGlobalFilter: localSetGlobalFilter,
  };
}
