# DataTable System

A config-driven, modular data table system built on TanStack Table v8.
Two ways to use it: **compound composition** (recommended) or **headless hook**.

---

## Quick Start

### 1. Define your data type

```typescript
// features/users/user.types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}
```

### 2. Define columns

```typescript
// features/users/lib/columns.tsx
import { DataTableColumnHeader } from "@shared/components/ui/DataTable";
import type { DataTableColumnDef } from "@shared/lib/data-table";
import type { User } from "../user.types";

export const userColumns: DataTableColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    size: 60,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
  },
];
```

### 3. Create the config

```typescript
// features/users/api/users-table.config.ts
import type { DataTableConfig } from "@shared/lib/data-table";
import type { User } from "../user.types";
import { userColumns } from "../lib/columns";

export const usersTableConfig: DataTableConfig<User> = {
  columns: userColumns,
  dataSource: {
    mode: "provider",
    resource: "/users",
  },
  pagination: { defaultPageSize: 10 },
  enableSorting: true,
  syncWithUrl: true,
};
```

### 4. Build the page (compound composition)

```tsx
// features/users/UsersPage.tsx
import { DT } from "@shared/components/ui/DataTable";
import { usersTableConfig } from "./api/users-table.config";

export function UsersPage() {
  return (
    <DT.Root config={usersTableConfig}>
      <DT.Toolbar>
        <DT.Search placeholder="Search users..." />
      </DT.Toolbar>
      <DT.Content />
      <DT.Pagination />
    </DT.Root>
  );
}
```

That's it. Search, pagination, sorting, loading states, and empty states all work out of the box.

---

## Data Source Modes

There are four ways to connect a table to data. Pick the one that fits your situation.

### mode: "provider" (recommended)

The table talks to your API through a **DataProvider** — a universal adapter that handles request building and response parsing. You configure the provider once, then every table just declares which resource to fetch.

```typescript
dataSource: {
  mode: "provider",
  resource: "/users",            // the provider knows your base URL, auth, params
}
```

The global provider is set up in `__root.tsx`. If a specific table needs a different API, override with a per-table provider:

```typescript
import { createRestProvider } from "@shared/lib/data-table";

const analyticsProvider = createRestProvider({
  baseUrl: "https://analytics.internal/v2",
  headers: () => ({ Authorization: `Bearer ${getAnalyticsToken()}` }),
  pagination: { style: "page", pageParam: "p", pageSizeParam: "per_page" },
  response: { dataPath: "results", totalPath: "meta.count" },
});

dataSource: {
  mode: "provider",
  resource: "/events",
  provider: analyticsProvider,   // this table uses its own provider
}
```

### mode: "api" (convenience shortcut)

For simple REST APIs where you just want to declare the URL and param mapping inline. No provider setup needed. Good for prototyping or external APIs.

```typescript
dataSource: {
  mode: "api",
  resource: "https://dummyjson.com/users/search",
  pagination: { style: "offset", skipParam: "skip", limitParam: "limit" },
  sort: { style: "flat", sortByParam: "sortBy", orderParam: "order" },
  searchParam: "q",
  staticParams: { select: "id,name,email" },
  response: { dataPath: "users", totalPath: "total" },
}
```

### mode: "server" (full control)

You write the fetch function yourself. Use this for non-standard APIs, GraphQL with custom logic, or complex data transformations.

```typescript
dataSource: {
  mode: "server",
  queryKey: ["users"],
  queryFn: async (params) => {
    const res = await fetch(`/api/users?page=${params.page}&size=${params.pageSize}`);
    const json = await res.json();
    return { data: json.items, total: json.totalCount };
  },
}
```

### mode: "client" (static data)

For data that's already in memory. Sorting, filtering, and pagination happen client-side.

```typescript
dataSource: {
  mode: "client",
  data: users,   // User[]
}
```

---

## Compound Composition (DT namespace)

The `DT` namespace provides context-aware components. Wrap everything in `DT.Root` and compose features as children. **Include a component = enable the feature. Remove it = disable it.**

### Available components

| Component | Purpose | Required props |
|-----------|---------|----------------|
| `DT.Root` | Wraps everything, provides context | `config` |
| `DT.Content` | Renders table/cards with loading/empty states | None |
| `DT.Toolbar` | Container for search, filters, with reset button | `children` |
| `DT.Search` | Debounced search input | None (reads from context) |
| `DT.Filter` | Faceted multi-select filter for a column | `column`, `title`, `options` |
| `DT.Pagination` | Page numbers, page size selector | None |
| `DT.BulkBar` | Floating bar when rows are selected | `children` |
| `DT.ViewToggle` | Switch between table and card view | None |
| `DT.ViewOptions` | Column visibility dropdown | None |

### Full example

```tsx
import { DT, useDataTableContext } from "@shared/components/ui/DataTable";
import { Button } from "@shared/components/ui/Button";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function ExportButton() {
  const { table } = useDataTableContext<User>();
  return (
    <Button onClick={() => exportCurrentPage(table, { filename: "users" })}>
      Export CSV
    </Button>
  );
}

export function UsersPage() {
  return (
    <DT.Root config={usersTableConfig} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <DT.ViewToggle />
          <ExportButton />
        </div>
      </div>

      <DT.Toolbar>
        <DT.Search placeholder="Search users..." />
        <DT.Filter column="status" title="Status" options={statusOptions} />
        <DT.Filter column="role" title="Role" options={roleOptions} />
      </DT.Toolbar>

      <DT.Content />

      <DT.Pagination showRowSelection />

      <DT.BulkBar>
        <Button>Export Selected</Button>
        <Button variant="destructive">Delete</Button>
      </DT.BulkBar>
    </DT.Root>
  );
}
```

### Custom rendering with DT.Content

Override loading/empty/table rendering with a render prop:

```tsx
<DT.Content>
  {({ table, isLoading, isEmpty }) => (
    isLoading ? <MyCustomSkeleton /> :
    isEmpty ? <MyCustomEmpty /> :
    <DataTable table={table} />
  )}
</DT.Content>
```

### Using context in custom components

Any component inside `DT.Root` can access table state:

```tsx
import { useDataTableContext } from "@shared/components/ui/DataTable";

function SelectedCount() {
  const { table } = useDataTableContext();
  const count = table.getFilteredSelectedRowModel().rows.length;
  return <span>{count} selected</span>;
}
```

---

## Headless Hook (useDataTable)

For fully custom layouts where compound composition doesn't fit. You get the raw table instance and build everything yourself.

```tsx
import { useDataTable } from "@shared/lib/data-table";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  DataTableFacetedFilter,
} from "@shared/components/ui/DataTable";

export function CustomPage() {
  const {
    table,
    isLoading,
    isFetching,
    isEmpty,
    globalFilter,
    setGlobalFilter,
    view,
    setView,
    availableViews,
  } = useDataTable(config);

  return (
    <div>
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        filterSlot={
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statusOptions}
          />
        }
      />
      {isLoading ? <Skeleton /> : <DataTable table={table} isFetching={isFetching} />}
      <DataTablePagination table={table} />
    </div>
  );
}
```

---

## DataProvider System

### Global provider setup

Set up once in `__root.tsx`. Every `mode: "provider"` table uses this by default.

```tsx
// app/routes/__root.tsx
import {
  applyMiddleware,
  createAxiosProvider,
  DataProviderRegistry,
  loggingMiddleware,
} from "@shared/lib/data-table";
import { apiClient } from "@shared/lib/api/client";

const dataProvider = applyMiddleware(
  import.meta.env.DEV ? [loggingMiddleware()] : [],
  createAxiosProvider(apiClient),
);

function RootComponent() {
  return (
    <DataProviderRegistry provider={dataProvider}>
      <Outlet />
    </DataProviderRegistry>
  );
}
```

### Built-in providers

#### REST Provider (zero dependencies)

Uses `globalThis.fetch`. No Axios needed.

```typescript
import { createRestProvider } from "@shared/lib/data-table";

const provider = createRestProvider({
  baseUrl: "/api/v1",
  headers: () => ({ Authorization: `Bearer ${getToken()}` }),
  pagination: { style: "offset", skipParam: "skip", limitParam: "limit" },
  sort: { style: "flat", sortByParam: "sortBy", orderParam: "order" },
  filter: { style: "flat", paramMap: { status: "filter_status" } },
  response: { dataPath: "data", totalPath: "total" },
  searchParam: "q",
  staticParams: { tenant: "acme" },
});
```

**Pagination styles:**

| Style | Params sent | Example |
|-------|-------------|---------|
| `"offset"` | `skip` + `limit` | `?skip=20&limit=10` |
| `"page"` | `page` + `pageSize` | `?page=2&pageSize=10` |

**Sort styles:**

| Style | Output | Example |
|-------|--------|---------|
| `"flat"` | Two params | `?sortBy=name&order=asc` |
| `"json"` | JSON array | `?sort=[{"field":"name","direction":"asc"}]` |
| `"repeated"` | Comma-separated | `?sort=name:asc,age:desc` |
| `"custom"` | Your function | `serialize: (sort) => ({...})` |

**Filter styles:**

| Style | Output | Example |
|-------|--------|---------|
| `"flat"` | Key-value pairs | `?status=active` |
| `"brackets"` | Rails-style | `?filter[status][eq]=active` |
| `"json"` | JSON string | `?filters=[{"field":"status",...}]` |
| `"custom"` | Your function | `serialize: (filters) => ({...})` |

#### Axios Provider

Wraps an Axios instance. Preserves all interceptors (auth, error handling, tenant headers).

```typescript
import { createAxiosProvider } from "@shared/lib/data-table";
import { apiClient } from "@shared/lib/api/client";

const provider = createAxiosProvider(apiClient, {
  pagination: { style: "offset" },
  response: { dataPath: "data", totalPath: "meta.total" },
});
```

#### GraphQL Provider

Each resource needs its own query, variables builder, and response transformer.

```typescript
import { createGraphQLProvider } from "@shared/lib/data-table";

const provider = createGraphQLProvider({
  endpoint: "https://api.example.com/graphql",
  headers: () => ({ Authorization: `Bearer ${getToken()}` }),
  resources: {
    "/products": {
      query: `
        query Products($first: Int, $after: String, $sortBy: ProductSortKey) {
          products(first: $first, after: $after, sortKey: $sortBy) {
            edges { node { id title price } }
            pageInfo { hasNextPage endCursor }
            totalCount
          }
        }
      `,
      variables: (params) => ({
        first: params.pagination.type === "cursor" ? params.pagination.limit : 10,
        after: params.pagination.type === "cursor" ? params.pagination.cursor : null,
        sortBy: params.sort[0]?.field.toUpperCase() ?? "TITLE",
      }),
      transformResponse: (data) => ({
        data: data.products.edges.map((e) => e.node),
        pagination: {
          type: "cursor",
          nextCursor: data.products.pageInfo.endCursor,
        },
        total: data.products.totalCount,
      }),
    },
  },
});
```

#### Custom Provider (any protocol)

Implement the `DataProvider` interface directly for non-standard backends.

```typescript
import type { DataProvider } from "@shared/lib/data-table";

const customProvider: DataProvider = {
  async getList(params) {
    const result = await mySDK.query({
      table: params.resource,
      offset: params.pagination.type === "offset" ? params.pagination.offset : 0,
      limit: params.pagination.type === "offset" ? params.pagination.limit : 20,
    });
    return {
      data: result.rows,
      total: result.totalCount,
      pagination: { type: "offset" },
    };
  },
};
```

### Middleware

Middlewares wrap a provider to add cross-cutting behavior. They compose left-to-right (first = outermost).

```typescript
import {
  applyMiddleware,
  loggingMiddleware,
  errorNormalizerMiddleware,
  retryMiddleware,
} from "@shared/lib/data-table";

const provider = applyMiddleware(
  [
    loggingMiddleware(),                              // logs timing + row count
    errorNormalizerMiddleware(),                       // standardizes error format
    retryMiddleware({ maxRetries: 2, delay: 1000 }),   // retries on 5xx
  ],
  createAxiosProvider(apiClient),
);
```

**Built-in middleware:**

| Middleware | What it does |
|-----------|-------------|
| `loggingMiddleware()` | Logs `[DataProvider] /users getList: 142ms, 10 rows` to console |
| `errorNormalizerMiddleware()` | Wraps any error into a standard `DataProviderError` |
| `retryMiddleware(opts)` | Retries on 5xx with exponential backoff |
| `validationMiddleware(schema)` | Validates each row with a Zod schema |

**Write your own:**

```typescript
import type { DataProviderMiddleware } from "@shared/lib/data-table";

function authMiddleware(getToken: () => string): DataProviderMiddleware {
  return (next) => ({
    async getList(params) {
      // Add auth to meta — provider can read it
      return next.getList({
        ...params,
        meta: { ...params.meta, token: getToken() },
      });
    },
  });
}
```

---

## Column Definitions

Columns use TanStack Table's `ColumnDef` extended with a `meta` field for DataTable-specific features.

### Basic column

```typescript
{
  accessorKey: "name",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
}
```

### Custom cell rendering

```typescript
{
  accessorKey: "status",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  cell: ({ row }) => (
    <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"}>
      {row.getValue("status")}
    </Badge>
  ),
}
```

### Computed column (no direct accessor)

```typescript
{
  id: "fullName",
  accessorFn: (row) => `${row.firstName} ${row.lastName}`,
  header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
}
```

### Column with avatar + subtext

```typescript
{
  id: "name",
  accessorFn: (row) => `${row.firstName} ${row.lastName}`,
  header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        <AvatarImage src={row.original.image} />
        <AvatarFallback>{row.original.firstName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
        <span className="text-muted-foreground text-xs">{row.original.email}</span>
      </div>
    </div>
  ),
  enableSorting: false,
}
```

### Column meta options

```typescript
{
  accessorKey: "notes",
  meta: {
    label: "Notes",                    // used in column visibility dropdown
    hiddenByDefault: true,             // hidden until user enables it
    exportable: true,                  // included in CSV export
    className: "max-w-[200px] truncate", // cell CSS class
  },
}
```

### Row actions column

```typescript
import { DataTableRowActions } from "@shared/components/ui/DataTable";

const actions = [
  { label: "View", icon: EyeIcon, onClick: (row) => navigate(`/users/${row.id}`) },
  { label: "Edit", icon: PencilIcon, onClick: (row) => navigate(`/users/${row.id}/edit`) },
  { label: "Delete", icon: TrashIcon, variant: "destructive", onClick: (row) => deleteUser(row.id) },
];

// Add as last column:
{
  id: "actions",
  cell: ({ row }) => <DataTableRowActions row={row.original} actions={actions} />,
  enableSorting: false,
  enableHiding: false,
  size: 40,
}
```

### Selection column

```typescript
import { createSelectionColumn } from "@shared/lib/data-table";

const columns = [createSelectionColumn<User>(), ...userColumns];
```

Requires `enableRowSelection: true` in the config.

---

## Config Reference

```typescript
interface DataTableConfig<TData> {
  // Required
  columns?: DataTableColumnDef<TData>[];
  dataSource: DataSource<TData>;

  // Pagination
  pagination?: {
    enabled?: boolean;               // default: true
    pageSizeOptions?: number[];      // default: [10, 20, 30, 50]
    defaultPageSize?: number;        // default: 10
  };

  // Search
  search?: {
    enabled?: boolean;
    placeholder?: string;
    debounceMs?: number;             // default: 300
  };

  // Features
  enableSorting?: boolean;           // default: true
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean | ((row: TData) => boolean);
  enableMultiSort?: boolean;

  // Views
  defaultView?: "table" | "card";
  cardRenderer?: (row: TData, opts: { isSelected; onSelect }) => ReactNode;

  // URL sync
  syncWithUrl?: boolean;             // default: true
  urlParamPrefix?: string;           // prefix for URL params (for multiple tables)

  // Actions
  rowActions?: DataTableRowAction<TData>[];
  bulkActions?: DataTableBulkAction<TData>[];

  // Export
  enableExport?: boolean;
  exportFilename?: string;

  // Display
  emptyState?: ReactNode;
}
```

---

## Features as Modules

Every feature can be independently enabled or disabled by including or removing its component. Here's how each one works.

### Search

```tsx
// Enabled — just include the component
<DT.Toolbar>
  <DT.Search placeholder="Search..." />
</DT.Toolbar>

// Disabled — remove the component
<DT.Toolbar>
  {/* no DT.Search = no search */}
</DT.Toolbar>
```

### Faceted Filters

```tsx
const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

<DT.Toolbar>
  <DT.Filter column="status" title="Status" options={statusOptions} />
  <DT.Filter column="role" title="Role" options={roleOptions} />
</DT.Toolbar>
```

### Row Selection + Bulk Actions

```typescript
// 1. Enable in config
enableRowSelection: true,

// 2. Add selection column
columns: [createSelectionColumn<User>(), ...userColumns],
```

```tsx
// 3. Add bulk bar
<DT.BulkBar>
  <Button onClick={handleExport}>Export Selected</Button>
  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
</DT.BulkBar>
```

### Table/Card View Toggle

```typescript
// 1. Provide a card renderer in config
cardRenderer: (user, { isSelected, onSelect }) => (
  <UserCard key={user.id} user={user} isSelected={isSelected} onSelect={onSelect} />
),
```

```tsx
// 2. Add toggle button
<DT.ViewToggle />

// DT.Content automatically switches between table and card grid
<DT.Content />
```

### Column Visibility

```tsx
<DT.ViewOptions />
```

Columns with `meta.hiddenByDefault: true` start hidden. Users toggle them in the dropdown.

### CSV Export

```tsx
import { exportCurrentPage, exportSelectedRows } from "@shared/lib/data-table";

function ExportButton() {
  const { table } = useDataTableContext();
  return (
    <Button onClick={() => exportCurrentPage(table, { filename: "users" })}>
      Export CSV
    </Button>
  );
}
```

### Runtime Feature Flags

Since features are React components, conditional rendering is your feature flag:

```tsx
<DT.Toolbar>
  <DT.Search />
  {featureFlags.advancedFilters && <DT.Filter column="status" ... />}
  {featureFlags.export && <ExportButton />}
</DT.Toolbar>
```

---

## Replacing a Feature

Any compound component can be replaced with your own. Use `useDataTableContext()` to access table state.

### Example: Replace pagination with infinite scroll

```tsx
import { useDataTableContext } from "@shared/components/ui/DataTable";

function InfiniteScrollLoader() {
  const { table, isFetching, hasNextPage } = useDataTableContext();

  const loadMore = () => {
    if (hasNextPage && !isFetching) {
      table.nextPage();
    }
  };

  return (
    <div ref={infiniteScrollRef} onIntersect={loadMore}>
      {isFetching && <Spinner />}
    </div>
  );
}

// Use it:
<DT.Root config={config}>
  <DT.Content />
  <InfiniteScrollLoader />  {/* replaces <DT.Pagination /> */}
</DT.Root>
```

### Example: Replace search with command palette

```tsx
function CommandPaletteSearch() {
  const { setGlobalFilter } = useDataTableContext();
  return <CommandPalette onSearch={setGlobalFilter} />;
}

<DT.Toolbar>
  <CommandPaletteSearch />  {/* replaces <DT.Search /> */}
</DT.Toolbar>
```

---

## Cursor Pagination

For APIs that use cursor-based pagination (Slack-style, GraphQL relay):

```typescript
dataSource: {
  mode: "provider",
  resource: "/messages",
  provider: myProvider,
  paginationType: "cursor",
},
```

The pagination UI automatically switches to prev/next buttons (no page numbers).

The provider must return:

```typescript
{
  data: [...],
  pagination: {
    type: "cursor",
    nextCursor: "abc123",        // null if no more pages
    previousCursor: "xyz789",    // optional
  },
  total: 1200,                   // optional for cursor
}
```

---

## URL State Sync

When `syncWithUrl: true` (default), table state is stored in the URL:

| State | URL param | Example |
|-------|-----------|---------|
| Page | `page` | `?page=2` |
| Page size | `pageSize` | `?pageSize=20` |
| Sort | `sort` | `?sort=name.asc` |
| Filters | `filters` | `?filters=[{"id":"status","value":"active"}]` |
| Search | `search` | `?search=john` |

Default values are omitted to keep URLs clean.

For multiple tables on one page, use `urlParamPrefix`:

```typescript
// Table 1
syncWithUrl: true,
urlParamPrefix: "users",    // ?users_page=2&users_sort=name.asc

// Table 2
syncWithUrl: true,
urlParamPrefix: "orders",   // ?orders_page=1&orders_sort=date.desc
```

---

## File Organization

Follow the feature-driven structure:

```
features/users/
├── UsersPage.tsx                 # page component (uses DT.Root)
├── api/
│   └── users-table.config.ts    # DataTableConfig
├── lib/
│   └── columns.tsx              # column definitions
├── components/
│   └── UserCard.tsx             # card renderer (optional)
├── user.types.ts                # data type
└── index.ts                     # public API
```

---

## Checklist: Adding a New Table

1. Define your data type (`*.types.ts`)
2. Define column definitions (`lib/columns.tsx`)
3. Create the config (`api/*-table.config.ts`)
4. Build the page with `DT.Root` + compound children
5. Create a route in `app/routes/`
6. Test: data loads, sorting works, pagination works, URL sync works

---

## Working Examples

| Route | What it demonstrates |
|-------|---------------------|
| `/demo-table` | Headless hook approach with `mode: "api"` (original) |
| `/demo-table-v2` | Compound composition with `mode: "provider"` + per-table REST provider |
