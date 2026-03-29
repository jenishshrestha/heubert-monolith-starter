// ---- Pagination ----

export type PaginationRequest =
  | { type: "offset"; offset: number; limit: number }
  | { type: "page"; page: number; pageSize: number }
  | { type: "cursor"; cursor: string | null; limit: number };

export type PaginationType = PaginationRequest["type"];

// ---- Sorting ----

export interface SortField {
  field: string;
  direction: "asc" | "desc";
}

// ---- Filtering ----

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "in"
  | "not_in"
  | "is_null"
  | "is_not_null";

export interface FilterField {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

// ---- Request ----

export interface GetListParams {
  resource: string;
  pagination: PaginationRequest;
  sort: SortField[];
  filters: FilterField[];
  search?: string;
  meta?: Record<string, unknown>;
  signal?: AbortSignal;
}

// ---- Response (discriminated union) ----

export type OffsetPageResponse<TData> = {
  data: TData[];
  total: number;
  pagination: { type: "offset" | "page" };
};

export type CursorResponse<TData> = {
  data: TData[];
  pagination: {
    type: "cursor";
    nextCursor: string | null;
    previousCursor?: string | null;
  };
  total?: number;
};

export type GetListResponse<TData> = OffsetPageResponse<TData> | CursorResponse<TData>;

// ---- DataProvider (the core contract) ----

export interface DataProvider {
  getList<TData = unknown>(params: GetListParams): Promise<GetListResponse<TData>>;
}
