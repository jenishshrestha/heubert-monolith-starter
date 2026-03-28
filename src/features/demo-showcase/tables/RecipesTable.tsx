/**
 * Use case: mode:"api" (convenience shortcut — zero provider setup)
 * Features: Search, faceted filters on cuisine + difficulty, image column
 */
import { Badge } from "@shared/components/ui/Badge";
import { DataTableColumnHeader, DT } from "@shared/lib/data-table";
import type { DataTableColumnDef, DataTableConfig } from "@shared/lib/data-table/data-table.types";
import { ClockIcon } from "lucide-react";
import type { Recipe } from "../demo-showcase.types";

const columns: DataTableColumnDef<Recipe>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    meta: { label: "ID" },
    size: 50,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Recipe" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          src={row.original.image}
          alt={row.original.name}
          className="size-10 rounded-md object-cover"
        />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
    meta: { label: "Recipe" },
    enableSorting: false,
  },
  {
    accessorKey: "cuisine",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cuisine" />,
    cell: ({ row }) => <Badge variant="outline">{row.getValue<string>("cuisine")}</Badge>,
    meta: { label: "Cuisine" },
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Difficulty" />,
    cell: ({ row }) => {
      const d = row.getValue<string>("difficulty");
      const variant = d === "Easy" ? "default" : d === "Medium" ? "secondary" : "destructive";
      return <Badge variant={variant}>{d}</Badge>;
    },
    meta: { label: "Difficulty" },
  },
  {
    id: "time",
    accessorFn: (row) => row.prepTimeMinutes + row.cookTimeMinutes,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Time" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-muted-foreground">
        <ClockIcon className="size-3.5" />
        <span className="tabular-nums">
          {row.original.prepTimeMinutes + row.original.cookTimeMinutes}m
        </span>
      </div>
    ),
    meta: { label: "Total Time" },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue<number>("rating").toFixed(1)}/5</span>
    ),
    meta: { label: "Rating" },
  },
];

const config: DataTableConfig<Recipe> = {
  columns,
  dataSource: {
    mode: "api",
    resource: "https://dummyjson.com/recipes/search",
    pagination: { style: "offset", skipParam: "skip", limitParam: "limit" },
    sort: { style: "flat", sortByParam: "sortBy", orderParam: "order" },
    searchParam: "q",
    staticParams: {
      select: "id,name,cuisine,difficulty,prepTimeMinutes,cookTimeMinutes,rating,image",
    },
    response: { dataPath: "recipes", totalPath: "total" },
  },
  toolbar: {
    search: { placeholder: "Search recipes..." },
  },
  pagination: { defaultPageSize: 5, pageSizeOptions: [5, 10, 20] },
  enableSorting: true,
  syncWithUrl: false,
};

export function RecipesTable() {
  return (
    <DT.Root config={config} className="space-y-4">
      <p className="text-muted-foreground text-sm">
        <code className="bg-muted rounded px-1 text-xs">mode: "api"</code> — Zero provider setup,
        inline config only. Server-side search via DummyJSON.
      </p>
      <DT.Toolbar />
      <DT.Content />
      <DT.Pagination />
    </DT.Root>
  );
}
