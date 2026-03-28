import type { ColumnDef, Table } from "@tanstack/react-table";

export type { FilterOperator, PaginationType } from "./provider/data-provider.types";

// ---- Data source modes (discriminated union) ----

export type ClientSideDataSource<TData> = {
  mode: "client";
  data: TData[];
};

export type ServerSideDataSource<TData> = {
  mode: "server";
  queryKey: readonly unknown[];
  queryFn: (params: DataTableQueryParams) => Promise<DataTableServerResponse<TData>>;
};

// ---- API adapter (transport layer) ----

export interface DataTableAdapterRequest {
  url: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface DataTableAdapter {
  fetch(request: DataTableAdapterRequest): Promise<unknown>;
}

// ---- API data source mapping config ----

export type PaginationMapping =
  | { style: "offset"; skipParam?: string; limitParam?: string }
  | { style: "page"; pageParam?: string; pageSizeParam?: string };

export type SortMapping =
  | {
      style: "flat";
      sortByParam?: string;
      orderParam?: string;
      descValue?: string;
      ascValue?: string;
    }
  | { style: "json"; param?: string };

export interface ResponseMapping<TData = unknown> {
  dataPath?: string;
  totalPath?: string;
  transform?: (raw: unknown) => DataTableServerResponse<TData>;
}

export type ApiDataSource<TData> = {
  mode: "api";
  resource: string;
  method?: "GET" | "POST";
  queryKey?: readonly unknown[];
  pagination?: PaginationMapping;
  sort?: SortMapping;
  searchParam?: string;
  filterMapping?: Record<string, string>;
  staticParams?: Record<string, string>;
  response?: ResponseMapping<TData>;
  headers?: Record<string, string>;
  adapter?: DataTableAdapter;
};

// ---- Provider data source (universal adapter) ----

export type ProviderDataSource<TData> = {
  mode: "provider";
  resource: string;
  provider?: import("./provider/data-provider.types").DataProvider;
  paginationType?: import("./provider/data-provider.types").PaginationType;
  queryKey?: readonly unknown[];
  meta?: Record<string, unknown>;
  responseSchema?: import("zod").ZodType<TData>;
};

export type DataSource<TData> =
  | ClientSideDataSource<TData>
  | ServerSideDataSource<TData>
  | ApiDataSource<TData>
  | ProviderDataSource<TData>;

// ---- Server-side contracts ----

export interface DataTableQueryParams {
  page: number;
  pageSize: number;
  sorting: { id: string; desc: boolean }[];
  filters: { id: string; value: unknown }[];
  search?: string;
}

export interface DataTableServerResponse<TData> {
  data: TData[];
  total: number;
  pageCount?: number;
}

// ---- Pagination config ----

export interface DataTablePaginationConfig {
  enabled?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
}

// ---- Search config ----

export interface DataTableSearchConfig {
  enabled?: boolean;
  placeholder?: string;
  debounceMs?: number;
  columnIds?: string[];
}

// ---- Filter types ----

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableColumnFilterConfig {
  type: "select" | "multi-select" | "text" | "date-range";
  options?: DataTableFilterOption[] | (() => Promise<DataTableFilterOption[]>);
  operators?: ("is" | "is_not" | "contains" | "starts_with" | "ends_with")[];
}

// ---- Extended column definition ----

export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  meta?: {
    label?: string;
    filter?: DataTableColumnFilterConfig;
    hiddenByDefault?: boolean;
    exportable?: boolean;
    className?: string;
  };
};

// ---- Row & bulk actions ----

export interface DataTableRowAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
  disabled?: (row: TData) => boolean;
  hidden?: (row: TData) => boolean;
}

export interface DataTableBulkAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: TData[]) => void;
  variant?: "default" | "destructive";
}

// ---- View types ----

export type DataTableView = "table" | "card";

// ---- Main config ----

export interface DataTableConfig<TData> {
  columns?: DataTableColumnDef<TData>[];
  cardRenderer?: (
    row: TData,
    options: { isSelected: boolean; onSelect: (selected: boolean) => void },
  ) => React.ReactNode;
  dataSource: DataSource<TData>;

  // Features
  pagination?: DataTablePaginationConfig;
  search?: DataTableSearchConfig;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean | ((row: TData) => boolean);
  enableMultiSort?: boolean;
  defaultView?: DataTableView;

  // URL sync
  syncWithUrl?: boolean;
  urlParamPrefix?: string;

  // Actions
  rowActions?: DataTableRowAction<TData>[];
  bulkActions?: DataTableBulkAction<TData>[];

  // Display
  emptyState?: React.ReactNode;

  // Export
  enableExport?: boolean;
  exportFilename?: string;
}

// ---- Hook return type ----

export interface UseDataTableReturn<TData> {
  table: Table<TData>;
  isLoading: boolean;
  isFetching: boolean;
  isEmpty: boolean;
  data: TData[];
  totalRows: number;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  view: DataTableView;
  setView: (view: DataTableView) => void;
  availableViews: DataTableView[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
