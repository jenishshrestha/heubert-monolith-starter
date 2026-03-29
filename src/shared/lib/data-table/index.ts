// ---- Types ----

// ---- UI Components ----
export * from "./components";
// ---- Core (stable public APIs only) ----
export type {
  DataProvider,
  DataProviderError,
  DataProviderMiddleware,
  FilterField,
  GetListParams,
  GetListResponse,
  PaginationRequest,
  SortField,
} from "./core";
export {
  applyMiddleware,
  createRestAdapter,
  DataProviderRegistry,
  DataTableProvider,
  isDataProviderError,
  normalizeError,
  type RestAdapterOptions,
  resolveDataSource,
  useDataProvider,
  useDataTableAdapter,
} from "./core";
export { errorNormalizerMiddleware } from "./middleware/error-normalizer";
// ---- Middleware ----
export { loggingMiddleware } from "./middleware/logging";
export { type RetryOptions, retryMiddleware } from "./middleware/retry";
export { validationMiddleware } from "./middleware/validation";
// ---- Main hook ----
export { useDataTable } from "./modules/useDataTable";
export { type AxiosProviderOptions, createAxiosProvider } from "./providers/axios-provider";
export { createGraphQLProvider, type GraphQLProviderOptions } from "./providers/graphql-provider";
export { createLegacyBridge } from "./providers/legacy-adapter-bridge";
// ---- Built-in providers ----
export { createRestProvider, type RestProviderOptions } from "./providers/rest-provider";
// ---- Router adapter ----
export type { RouterAdapter, RouterSearchParamsReturn } from "./router";
export { createTanStackRouterAdapter, RouterAdapterProvider, useRouterAdapter } from "./router";
export { useDataTableSearchParams } from "./router/useDataTableSearchParams";
// ---- Schemas ----
export { createDataTableSearchSchema, dataTableSearchSchema } from "./schemas/data-table.schema";
export type {
  ApiDataSource,
  ClientSideDataSource,
  DataSource,
  DataTableAdapter,
  DataTableAdapterRequest,
  DataTableBulkAction,
  DataTableColumnDef,
  DataTableColumnFilterConfig,
  DataTableConfig,
  DataTableFilterOption,
  DataTablePaginationConfig,
  DataTableQueryParams,
  DataTableRowAction,
  DataTableSearchConfig,
  DataTableServerResponse,
  DataTableToolbarConfig,
  DataTableView,
  FilterOperator,
  PaginationMapping,
  PaginationType,
  ProviderDataSource,
  ResponseMapping,
  ServerSideDataSource,
  SortMapping,
  ToolbarFilterConfig,
  UseDataTableReturn,
} from "./types/data-table.types";
// ---- Utils ----
export { exportCurrentPage, exportFromServer, exportSelectedRows } from "./utils/export-csv";
