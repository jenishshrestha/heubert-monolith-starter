/**
 * Use case: Custom DataProvider with REAL server-side filtering
 * API: Rick and Morty (https://rickandmortyapi.com)
 *
 * Demonstrates:
 * - Custom DataProvider that maps filters to query params
 * - Dynamic filter options (status, gender) applied server-side
 * - Server-side text search via ?name=
 * - Page-based pagination with total count
 * - Stable, read-only dataset (no sandbox mutation)
 */
import { Badge } from "@shared/components/ui/Badge";
import { DataTableColumnHeader, DT } from "@shared/components/ui/DataTable";
import type { DataProvider, GetListResponse } from "@shared/lib/data-table";
import type { DataTableColumnDef, DataTableConfig } from "@shared/lib/data-table/data-table.types";

// ---- Types ----

interface Character {
  id: number;
  name: string;
  status: "Alive" | "Dead" | "unknown";
  species: string;
  type: string;
  gender: "Female" | "Male" | "Genderless" | "unknown";
  origin: { name: string };
  location: { name: string };
  image: string;
  episode: string[];
}

// ---- Filter options (static — the API has fixed values) ----

const statusOptions = [
  { label: "Alive", value: "Alive" },
  { label: "Dead", value: "Dead" },
  { label: "Unknown", value: "unknown" },
];

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Genderless", value: "Genderless" },
  { label: "Unknown", value: "unknown" },
];

// ---- Custom DataProvider ----
// Rick and Morty uses page-based pagination and filter params directly on the URL.
// Filters are ?status=Alive&gender=Male (single values, not arrays).

const API_BASE = "https://rickandmortyapi.com/api/character";

const rickAndMortyProvider: DataProvider = {
  async getList<TData>(params) {
    const searchParams = new URLSearchParams();

    // Pagination (page-based, 1-indexed)
    const page =
      params.pagination.type === "page"
        ? params.pagination.page + 1
        : params.pagination.type === "offset"
          ? Math.floor(params.pagination.offset / params.pagination.limit) + 1
          : 1;
    searchParams.set("page", String(page));

    // Text search
    if (params.search) {
      searchParams.set("name", params.search);
    }

    // Filters → query params
    for (const filter of params.filters) {
      if (filter.operator === "in") {
        // Faceted filter sends array — Rick and Morty only accepts single value
        const values = filter.value as string[];
        const first = values[0];
        if (first) {
          searchParams.set(filter.field, first);
        }
      } else {
        searchParams.set(filter.field, String(filter.value));
      }
    }

    const url = `${API_BASE}/?${searchParams.toString()}`;
    const res = await fetch(url, { signal: params.signal });

    // Rick and Morty returns 404 when no results match filters
    if (res.status === 404) {
      return {
        data: [],
        total: 0,
        pagination: { type: "page" },
      } as GetListResponse<TData>;
    }

    if (!res.ok) {
      throw new Error(`Rick and Morty API failed: ${res.status}`);
    }

    const json = (await res.json()) as {
      info: { count: number; pages: number };
      results: TData[];
    };

    return {
      data: json.results,
      total: json.info.count,
      pagination: { type: "page" },
    } as GetListResponse<TData>;
  },
};

// ---- Columns ----

const columns: DataTableColumnDef<Character>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    meta: { label: "ID" },
    size: 50,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Character" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          src={row.original.image}
          alt={row.original.name}
          className="size-10 rounded-full object-cover"
        />
        <div>
          <span className="font-medium">{row.original.name}</span>
          <p className="text-muted-foreground text-xs">{row.original.species}</p>
        </div>
      </div>
    ),
    meta: { label: "Character" },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      const variant =
        status === "Alive" ? "default" : status === "Dead" ? "destructive" : "secondary";
      return <Badge variant={variant}>{status}</Badge>;
    },
    meta: { label: "Status" },
  },
  {
    accessorKey: "gender",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
    cell: ({ row }) => <Badge variant="outline">{row.getValue<string>("gender")}</Badge>,
    meta: { label: "Gender" },
  },
  {
    id: "origin",
    accessorFn: (row) => row.origin.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Origin" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground max-w-[180px] truncate text-sm">
        {row.original.origin.name}
      </span>
    ),
    meta: { label: "Origin" },
    enableSorting: false,
  },
  {
    id: "location",
    accessorFn: (row) => row.location.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
    cell: ({ row }) => (
      <span className="max-w-[180px] truncate text-sm">{row.original.location.name}</span>
    ),
    meta: { label: "Location" },
    enableSorting: false,
  },
  {
    id: "episodes",
    accessorFn: (row) => row.episode.length,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Episodes" />,
    cell: ({ row }) => <span className="tabular-nums">{row.original.episode.length}</span>,
    meta: { label: "Episodes" },
  },
];

// ---- Config ----
// Rick and Morty API returns 20 per page (fixed). No configurable page size.

const config: DataTableConfig<Character> = {
  columns,
  dataSource: {
    mode: "provider",
    resource: API_BASE,
    provider: rickAndMortyProvider,
    paginationType: "page",
  },
  pagination: { defaultPageSize: 20, pageSizeOptions: [20] },
  enableSorting: false, // Rick and Morty API doesn't support sorting
  syncWithUrl: false,
};

// ---- Component ----

export function CharactersTable() {
  return (
    <DT.Root config={config} className="space-y-4">
      <p className="text-muted-foreground text-sm">
        <code className="bg-muted rounded px-1 text-xs">mode: "provider"</code> — Custom
        DataProvider for Rick and Morty API. Filters applied <strong>server-side</strong> via{" "}
        <code className="bg-muted rounded px-1 text-xs">?status=Alive&gender=Male</code>. Stable
        dataset, 826 characters.
      </p>
      <DT.Toolbar>
        <DT.Search placeholder="Search characters..." />
        <DT.SingleFilter column="status" title="Status" options={statusOptions} />
        <DT.SingleFilter column="gender" title="Gender" options={genderOptions} />
      </DT.Toolbar>
      <DT.Content />
      <DT.Pagination />
    </DT.Root>
  );
}
