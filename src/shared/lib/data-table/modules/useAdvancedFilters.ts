import { useCallback, useMemo, useState } from "react";
import { useRouterAdapter } from "../router/RouterAdapterProvider";
import type { RouterAdapter } from "../router/router-adapter.types";
import { buildAdvancedFilterUpdates, readAdvancedFiltersFromParams } from "../router/serialization";
import type { AdvancedFilterConfig } from "../types/data-table.types";

export type AdvancedFilterState = Record<string, string[]>;

export interface UseAdvancedFiltersReturn {
  /** Current filter values, keyed by section.key */
  filters: AdvancedFilterState;
  /** Set filters for a single section */
  setSection: (key: string, values: string[]) => void;
  /** Replace the entire filter state */
  setFilters: (filters: AdvancedFilterState) => void;
  /** Clear one section */
  clearSection: (key: string) => void;
  /** Clear all filters */
  clearAll: () => void;
  /** Total count of selected values across all sections */
  activeCount: number;
  /** Whether an advanced-filter config is present */
  enabled: boolean;
}

interface UseAdvancedFiltersOptions {
  /** When true and a RouterAdapter is available, persists to URL. */
  syncWithUrl?: boolean;
  /** URL param prefix for filter sections (defaults to "af."). */
  urlParamPrefix?: string;
}

/** Noop adapter so the hook can always call useSearchParams — rules-of-hooks */
const noopAdapter: RouterAdapter = {
  useSearchParams: () => ({
    getParams: () => ({}),
    setParams: () => {},
  }),
};

/**
 * Advanced filter state — owned by DataTable when config.advancedFilters is set.
 * Consumed by FilterBar, AdvancedFilterSheet, and queryFn via DataTableQueryParams.advancedFilters.
 *
 * When `syncWithUrl` is true and a RouterAdapter is provided, the filter state is
 * read from / written to the URL under the `af` search param. Otherwise, falls back
 * to local React state.
 */
export function useAdvancedFilters(
  config: AdvancedFilterConfig | undefined,
  options: UseAdvancedFiltersOptions = {},
): UseAdvancedFiltersReturn {
  const { syncWithUrl = false, urlParamPrefix = "af." } = options;

  const routerAdapter = useRouterAdapter();
  const adapter = routerAdapter ?? noopAdapter;
  const { getParams, setParams } = adapter.useSearchParams();
  const params = getParams();

  const urlActive = syncWithUrl && routerAdapter !== null;

  const urlFilters = useMemo<AdvancedFilterState>(
    () => (urlActive ? readAdvancedFiltersFromParams(params, urlParamPrefix) : {}),
    [urlActive, params, urlParamPrefix],
  );

  const [localFilters, setLocalFilters] = useState<AdvancedFilterState>({});

  const filters = urlActive ? urlFilters : localFilters;

  const writeFilters = useCallback(
    (next: AdvancedFilterState) => {
      if (urlActive) {
        setParams(buildAdvancedFilterUpdates(next, params, urlParamPrefix));
      } else {
        setLocalFilters(next);
      }
    },
    [urlActive, setParams, urlParamPrefix, params],
  );

  const setFilters = useCallback(
    (next: AdvancedFilterState) => {
      writeFilters(next);
    },
    [writeFilters],
  );

  const setSection = useCallback(
    (key: string, values: string[]) => {
      const next =
        values.length === 0
          ? (() => {
              const { [key]: _removed, ...rest } = filters;
              return rest;
            })()
          : { ...filters, [key]: values };
      writeFilters(next);
    },
    [filters, writeFilters],
  );

  const clearSection = useCallback(
    (key: string) => {
      const { [key]: _removed, ...rest } = filters;
      writeFilters(rest);
    },
    [filters, writeFilters],
  );

  const clearAll = useCallback(() => {
    writeFilters({});
  }, [writeFilters]);

  const activeCount = useMemo(
    () => Object.values(filters).reduce((sum, values) => sum + values.length, 0),
    [filters],
  );

  return {
    filters,
    setSection,
    setFilters,
    clearSection,
    clearAll,
    activeCount,
    enabled: Boolean(config),
  };
}
