import type {
  DataProvider,
  FilterField,
  GetListParams,
  GetListResponse,
  SortField,
} from "../core/data-provider.types";
import { getByPath, resolveHeaders } from "../core/utils";

// ---- Mapping config types ----

export type RestPaginationMapping =
  | { style: "offset"; skipParam?: string; limitParam?: string }
  | { style: "page"; pageParam?: string; pageSizeParam?: string };

export type RestSortMapping =
  | {
      style: "flat";
      sortByParam?: string;
      orderParam?: string;
      descValue?: string;
      ascValue?: string;
    }
  | { style: "json"; param?: string }
  | { style: "repeated"; param?: string }
  | { style: "custom"; serialize: (sort: SortField[]) => Record<string, string> };

export type RestFilterMapping =
  | { style: "flat"; paramMap?: Record<string, string> }
  | { style: "brackets" }
  | { style: "json"; param?: string }
  | { style: "custom"; serialize: (filters: FilterField[]) => Record<string, string> };

export interface RestResponseMapping {
  dataPath?: string;
  totalPath?: string;
  cursorPath?: string;
  previousCursorPath?: string;
  transform?: (raw: unknown) => GetListResponse<unknown>;
}

export interface RestProviderOptions {
  baseUrl?: string;
  httpClient?: (url: string, init: RequestInit) => Promise<Response>;
  headers?: Record<string, string> | (() => Record<string, string>);
  pagination?: RestPaginationMapping;
  sort?: RestSortMapping;
  filter?: RestFilterMapping;
  response?: RestResponseMapping;
  /** The query parameter name for global search (default: "q"). */
  searchParam?: string;
  /** Static params appended to every request. */
  staticParams?: Record<string, string>;
}

// ---- Helpers ----
// getByPath and resolveHeaders imported from ../provider/utils

function buildPaginationParams(
  params: GetListParams,
  mapping: RestPaginationMapping,
): Record<string, string> {
  const result: Record<string, string> = {};
  const pag = params.pagination;

  if (pag.type === "cursor") {
    // Cursor pagination: always send limit + cursor param
    const limit = pag.limit;
    if (mapping.style === "offset") {
      result[mapping.limitParam ?? "limit"] = String(limit);
    } else {
      result[mapping.pageSizeParam ?? "pageSize"] = String(limit);
    }
    if (pag.cursor) {
      result.cursor = pag.cursor;
    }
    return result;
  }

  if (mapping.style === "offset") {
    const offset = pag.type === "offset" ? pag.offset : pag.page * pag.pageSize;
    const limit = pag.type === "offset" ? pag.limit : pag.pageSize;
    result[mapping.skipParam ?? "skip"] = String(offset);
    result[mapping.limitParam ?? "limit"] = String(limit);
  } else {
    const page = pag.type === "page" ? pag.page : Math.floor(pag.offset / pag.limit);
    const pageSize = pag.type === "page" ? pag.pageSize : pag.limit;
    result[mapping.pageParam ?? "page"] = String(page);
    result[mapping.pageSizeParam ?? "pageSize"] = String(pageSize);
  }

  return result;
}

function buildSortParams(sort: SortField[], mapping: RestSortMapping): Record<string, string> {
  if (sort.length === 0) {
    return {};
  }

  switch (mapping.style) {
    case "flat": {
      const first = sort[0] as (typeof sort)[0];
      return {
        [mapping.sortByParam ?? "sortBy"]: first.field,
        [mapping.orderParam ?? "order"]:
          first.direction === "desc" ? (mapping.descValue ?? "desc") : (mapping.ascValue ?? "asc"),
      };
    }
    case "json":
      return { [mapping.param ?? "sort"]: JSON.stringify(sort) };
    case "repeated":
      // Encoded as: sort=name:asc&sort=age:desc
      // Since we return a flat object, we join with comma for single param
      return { [mapping.param ?? "sort"]: sort.map((s) => `${s.field}:${s.direction}`).join(",") };
    case "custom":
      return mapping.serialize(sort);
  }
}

function buildFilterParams(
  filters: FilterField[],
  mapping: RestFilterMapping,
): Record<string, string> {
  if (filters.length === 0) {
    return {};
  }

  switch (mapping.style) {
    case "flat": {
      const result: Record<string, string> = {};
      for (const f of filters) {
        const paramName = mapping.paramMap?.[f.field] ?? f.field;
        result[paramName] = Array.isArray(f.value) ? f.value.join(",") : String(f.value);
      }
      return result;
    }
    case "brackets": {
      const result: Record<string, string> = {};
      for (const f of filters) {
        result[`filter[${f.field}][${f.operator}]`] = Array.isArray(f.value)
          ? f.value.join(",")
          : String(f.value);
      }
      return result;
    }
    case "json":
      return { [mapping.param ?? "filters"]: JSON.stringify(filters) };
    case "custom":
      return mapping.serialize(filters);
  }
}

function buildUrl(baseUrl: string, resource: string, params: Record<string, string>): string {
  const base = baseUrl.replace(/\/$/, "");
  const path = resource.startsWith("/") ? resource : `/${resource}`;
  const fullUrl = resource.startsWith("http") ? resource : `${base}${path}`;

  const url = new URL(fullUrl, fullUrl.startsWith("http") ? undefined : "http://localhost");
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  return resource.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`;
}

function parseResponse<TData>(
  raw: unknown,
  params: GetListParams,
  mapping: RestResponseMapping | undefined,
): GetListResponse<TData> {
  if (mapping?.transform) {
    return mapping.transform(raw) as GetListResponse<TData>;
  }

  const dataPath = mapping?.dataPath ?? "data";
  const totalPath = mapping?.totalPath ?? "total";
  const data = (getByPath(raw, dataPath) as TData[]) ?? [];
  const total = (getByPath(raw, totalPath) as number) ?? 0;

  // Cursor response
  if (params.pagination.type === "cursor") {
    const cursorPath = mapping?.cursorPath ?? "pageInfo.endCursor";
    const prevCursorPath = mapping?.previousCursorPath ?? "pageInfo.startCursor";
    return {
      data,
      total,
      pagination: {
        type: "cursor",
        nextCursor: (getByPath(raw, cursorPath) as string) ?? null,
        previousCursor: (getByPath(raw, prevCursorPath) as string) ?? null,
      },
    };
  }

  return {
    data,
    total,
    pagination: { type: params.pagination.type === "page" ? "page" : "offset" },
  };
}

// ---- Factory ----

export function createRestProvider(options: RestProviderOptions = {}): DataProvider {
  const {
    baseUrl = "",
    httpClient = globalThis.fetch.bind(globalThis),
    headers: headerConfig,
    pagination: paginationMapping = { style: "offset" },
    sort: sortMapping = { style: "flat" },
    filter: filterMapping = { style: "flat" },
    response: responseMapping,
    searchParam = "q",
    staticParams = {},
  } = options;

  return {
    async getList<TData>(params: GetListParams): Promise<GetListResponse<TData>> {
      const queryParams: Record<string, string> = {
        ...buildPaginationParams(params, paginationMapping),
        ...buildSortParams(params.sort, sortMapping),
        ...buildFilterParams(params.filters, filterMapping),
        ...(params.search ? { [searchParam]: params.search } : {}),
        ...staticParams,
      };

      const url = buildUrl(baseUrl, params.resource, queryParams);
      const headers = resolveHeaders(headerConfig);

      const response = await httpClient(url, {
        method: "GET",
        headers,
        signal: params.signal,
      });

      if (!response.ok) {
        throw new Error(`DataProvider fetch failed: ${response.status} ${response.statusText}`);
      }

      let raw: unknown;
      try {
        raw = await response.json();
      } catch {
        throw new Error(`DataProvider: invalid JSON response from ${params.resource}`);
      }

      return parseResponse<TData>(raw, params, responseMapping);
    },
  };
}
