import type {
  ApiDataSource,
  ClientSideDataSource,
  DataSource,
  DataTableAdapter,
  DataTableQueryParams,
  DataTableServerResponse,
  ServerSideDataSource,
} from "../types/data-table.types";
import { getByPath } from "./utils";

const defaultAdapter: DataTableAdapter = {
  async fetch(request) {
    const init: RequestInit = {
      method: request.method,
      headers: request.headers,
      signal: request.signal,
    };

    if (request.method === "POST" && request.body) {
      init.headers = { ...init.headers, "Content-Type": "application/json" };
      init.body = JSON.stringify(request.body);
    }

    const res = await globalThis.fetch(request.url, init);
    if (!res.ok) {
      throw new Error(`DataTable fetch failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
};

function buildParams<TData>(
  params: DataTableQueryParams,
  config: ApiDataSource<TData>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Pagination
  const pag = config.pagination ?? { style: "offset" };
  if (pag.style === "offset") {
    result[pag.skipParam ?? "skip"] = params.page * params.pageSize;
    result[pag.limitParam ?? "limit"] = params.pageSize;
  } else {
    result[pag.pageParam ?? "page"] = params.page;
    result[pag.pageSizeParam ?? "pageSize"] = params.pageSize;
  }

  // Sorting
  const sort = params.sorting[0];
  if (sort) {
    const sortConfig = config.sort ?? { style: "flat" };
    if (sortConfig.style === "flat") {
      result[sortConfig.sortByParam ?? "sortBy"] = sort.id;
      result[sortConfig.orderParam ?? "order"] = sort.desc
        ? (sortConfig.descValue ?? "desc")
        : (sortConfig.ascValue ?? "asc");
    } else {
      result[sortConfig.param ?? "sort"] = params.sorting;
    }
  }

  // Search
  if (params.search) {
    result[config.searchParam ?? "q"] = params.search;
  }

  // Filters
  if (config.filterMapping) {
    for (const filter of params.filters) {
      const paramName = config.filterMapping[filter.id] ?? filter.id;
      result[paramName] = filter.value;
    }
  }

  // Static params
  if (config.staticParams) {
    for (const [key, value] of Object.entries(config.staticParams)) {
      result[key] = value;
    }
  }

  return result;
}

function buildGetUrl(resource: string, params: Record<string, unknown>): string {
  const url = new URL(resource, resource.startsWith("http") ? undefined : "http://localhost");
  const isAbsolute = resource.startsWith("http");

  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      url.searchParams.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }
  }

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
}

function parseResponse<TData>(
  raw: unknown,
  config: ApiDataSource<TData>,
): DataTableServerResponse<TData> {
  const responseConfig = config.response;

  if (responseConfig?.transform) {
    return responseConfig.transform(raw);
  }

  const dataPath = responseConfig?.dataPath ?? "data";
  const totalPath = responseConfig?.totalPath ?? "total";

  return {
    data: (getByPath(raw, dataPath) as TData[]) ?? [],
    total: (getByPath(raw, totalPath) as number) ?? 0,
  };
}

export function resolveDataSource<TData>(
  dataSource: DataSource<TData>,
  contextAdapter?: DataTableAdapter | null,
): ClientSideDataSource<TData> | ServerSideDataSource<TData> {
  if (dataSource.mode !== "api") {
    return dataSource;
  }

  const adapter = dataSource.adapter ?? contextAdapter ?? defaultAdapter;
  const method = dataSource.method ?? "GET";

  return {
    mode: "server",
    queryKey: dataSource.queryKey ?? [dataSource.resource],
    queryFn: async (params: DataTableQueryParams) => {
      const builtParams = buildParams(params, dataSource);

      const raw = await adapter.fetch({
        url: method === "GET" ? buildGetUrl(dataSource.resource, builtParams) : dataSource.resource,
        method,
        headers: dataSource.headers,
        body: method === "POST" ? builtParams : undefined,
      });

      return parseResponse(raw, dataSource);
    },
  };
}
