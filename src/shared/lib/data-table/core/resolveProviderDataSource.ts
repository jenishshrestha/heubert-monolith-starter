import type { DataTableQueryParams, DataTableServerResponse } from "../types/data-table.types";
import type {
  DataProvider,
  FilterField,
  GetListResponse,
  PaginationRequest,
  PaginationType,
  SortField,
} from "./data-provider.types";

interface ProviderResolutionConfig {
  resource: string;
  provider: DataProvider;
  paginationType: PaginationType;
  queryKey: readonly unknown[];
  meta?: Record<string, unknown>;
}

/**
 * Build a PaginationRequest from TanStack Table's pageIndex/pageSize state.
 */
function buildPaginationRequest(
  page: number,
  pageSize: number,
  paginationType: PaginationType,
  cursorMap: Map<number, string>,
): PaginationRequest {
  switch (paginationType) {
    case "offset":
      return { type: "offset", offset: page * pageSize, limit: pageSize };
    case "page":
      return { type: "page", page, pageSize };
    case "cursor":
      return { type: "cursor", cursor: cursorMap.get(page) ?? null, limit: pageSize };
  }
}

/**
 * Convert TanStack Table sorting state to SortField[].
 */
function toSortFields(sorting: { id: string; desc: boolean }[]): SortField[] {
  return sorting.map((s) => ({ field: s.id, direction: s.desc ? "desc" : "asc" }));
}

/**
 * Convert TanStack Table column filters to FilterField[].
 * Filters without an explicit operator default to "eq".
 * Multi-select values (arrays) use "in".
 */
function toFilterFields(filters: { id: string; value: unknown }[]): FilterField[] {
  return filters.map((f) => {
    if (Array.isArray(f.value)) {
      return { field: f.id, operator: "in" as const, value: f.value };
    }
    return { field: f.id, operator: "eq" as const, value: f.value };
  });
}

/**
 * Normalize a GetListResponse into DataTableServerResponse.
 */
function normalizeResponse<TData>(
  response: GetListResponse<TData>,
): DataTableServerResponse<TData> & { nextCursor?: string | null; previousCursor?: string | null } {
  if (response.pagination.type === "cursor") {
    return {
      data: response.data,
      total: response.total ?? 0,
      nextCursor: response.pagination.nextCursor,
      previousCursor: response.pagination.previousCursor,
    };
  }

  return {
    data: response.data,
    total: response.total,
  };
}

/**
 * Creates a queryFn and queryKey from a DataProvider + config.
 * This bridges mode:"provider" into the existing useDataTableQuery pipeline.
 */
export function resolveProviderDataSource<TData>(
  config: ProviderResolutionConfig,
  cursorMap: Map<number, string>,
) {
  return {
    mode: "server" as const,
    queryKey: config.queryKey,
    queryFn: async (params: DataTableQueryParams) => {
      const response = await config.provider.getList<TData>({
        resource: config.resource,
        pagination: buildPaginationRequest(
          params.page,
          params.pageSize,
          config.paginationType,
          cursorMap,
        ),
        sort: toSortFields(params.sorting),
        filters: toFilterFields(params.filters),
        search: params.search,
        meta: config.meta,
      });

      // Store cursor for next page navigation
      if (response.pagination.type === "cursor" && response.pagination.nextCursor) {
        cursorMap.set(params.page + 1, response.pagination.nextCursor);
      }

      return normalizeResponse(response);
    },
  };
}
