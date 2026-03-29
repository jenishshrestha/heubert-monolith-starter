/**
 * Use case: mode:"provider" with REAL server-side filtering
 * API: Platzi Fake Store (https://fakeapi.platzi.com)
 *
 * Features demonstrated:
 * - Dynamic filter options fetched from GET /categories
 * - Server-side filtering via ?categoryId=X query param
 * - Server-side search via ?title=X
 * - Custom provider with response.transform (API returns raw array, no total)
 * - Price range filtering via ?price_min=X&price_max=X
 */
import { Badge } from "@shared/components/ui/Badge";
import type { DataProvider, GetListResponse } from "@shared/lib/data-table";
import { DataTableColumnHeader, DT } from "@shared/lib/data-table";
import type { DataTableColumnDef, DataTableConfig } from "@shared/lib/data-table/data-table.types";
import { useQuery } from "@tanstack/react-query";
import type { PlatziCategory, PlatziProduct } from "../demo-showcase.types";

const API_BASE = "https://api.escuelajs.co/api/v1";

// ---- Dynamic filter options from /categories API ----

function useCategoryOptions() {
  return useQuery({
    queryKey: ["platzi-categories"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status}`);
      }
      const categories: PlatziCategory[] = await res.json();
      return categories.map((c) => ({ label: c.name, value: String(c.id) }));
    },
    staleTime: 1000 * 60 * 60,
  });
}

// ---- Custom DataProvider for Platzi API ----
// Platzi returns a raw array (no { data, total } wrapper),
// so we need a custom provider to handle the response shape.

const platziProvider: DataProvider = {
  async getList<TData>(params) {
    const searchParams = new URLSearchParams();

    // Pagination — fetch limit+1 to detect next page
    const limit = params.pagination.type === "offset" ? params.pagination.limit : 10;
    const offset = params.pagination.type === "offset" ? params.pagination.offset : 0;
    searchParams.set("offset", String(offset));
    searchParams.set("limit", String(limit + 1)); // +1 to peek if more exist

    // Search by title
    if (params.search) {
      searchParams.set("title", params.search);
    }

    // Filters → query params (categoryId)
    for (const filter of params.filters) {
      if (filter.field === "category" && filter.operator === "in") {
        const values = filter.value as string[];
        const first = values[0];
        if (first) {
          searchParams.set("categoryId", first);
        }
      }
    }

    const url = `${API_BASE}/products?${searchParams.toString()}`;
    const res = await fetch(url, { signal: params.signal });

    if (!res.ok) {
      throw new Error(`Platzi API failed: ${res.status} ${res.statusText}`);
    }

    const items: TData[] = await res.json();

    // If we got limit+1 items, there are more pages. Return only `limit` items.
    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, limit) : items;

    // Calculate a realistic total for pagination display.
    // We know at least: all items before this page + items on this page + (1 if more exist).
    const knownTotal = offset + pageItems.length + (hasMore ? 1 : 0);

    return {
      data: pageItems,
      total: knownTotal,
      pagination: { type: "offset" },
    } as GetListResponse<TData>;
  },
};

// ---- Columns ----

const columns: DataTableColumnDef<PlatziProduct>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    meta: { label: "ID" },
    size: 60,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
    cell: ({ row }) => {
      const img = row.original.images[0];
      const isValid = img && !img.includes("[") && !img.includes("any");
      return (
        <div className="flex items-center gap-3">
          {isValid ? (
            <img src={img} alt={row.original.title} className="size-10 rounded-md object-cover" />
          ) : (
            <div className="bg-muted flex size-10 items-center justify-center rounded-md text-xs">
              N/A
            </div>
          )}
          <div className="max-w-[250px]">
            <span className="font-medium line-clamp-1">{row.original.title}</span>
            <p className="text-muted-foreground text-xs line-clamp-1">{row.original.description}</p>
          </div>
        </div>
      );
    },
    meta: { label: "Product" },
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">${row.getValue<number>("price")}</span>
    ),
    meta: { label: "Price" },
  },
  {
    id: "category",
    accessorFn: (row) => String(row.category.id),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => <Badge variant="outline">{row.original.category.name}</Badge>,
    meta: { label: "Category" },
  },
];

// ---- Config ----

const config: DataTableConfig<PlatziProduct> = {
  columns,
  dataSource: {
    mode: "provider",
    resource: `${API_BASE}/products`,
    provider: platziProvider,
    paginationType: "offset",
  },
  toolbar: {
    search: { placeholder: "Search by title..." },
    // Category filter added dynamically via children (options fetched from API)
  },
  pagination: { defaultPageSize: 5, pageSizeOptions: [5, 10, 20] },
  enableSorting: false,
  syncWithUrl: false,
};

// ---- Component ----

export function ProductsTable() {
  const {
    data: categoryOptions = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoryOptions();

  return (
    <DT.Root config={config} className="space-y-4">
      <p className="text-muted-foreground text-sm">
        <code className="bg-muted rounded px-1 text-xs">mode: "provider"</code> — Custom
        DataProvider for Platzi API. Category filter fetched from{" "}
        <code className="bg-muted rounded px-1 text-xs">GET /categories</code> and applied
        server-side via <code className="bg-muted rounded px-1 text-xs">?categoryId=X</code>.
        {categoriesError
          ? " Failed to load categories."
          : categoriesLoading
            ? " Loading categories..."
            : ` ${categoryOptions.length} categories.`}
      </p>
      <DT.Toolbar>
        <DT.Search placeholder="Search by title..." />
        {categoryOptions.length > 0 && (
          <DT.Filter column="category" title="Category" options={categoryOptions} />
        )}
      </DT.Toolbar>
      <DT.Content />
      <DT.Pagination />
    </DT.Root>
  );
}
