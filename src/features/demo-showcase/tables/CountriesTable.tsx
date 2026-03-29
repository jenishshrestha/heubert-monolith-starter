/**
 * Use case: mode:"client" (static data, all filtering/sorting client-side)
 * Features: Client-side search, sort, filter — no server requests after initial load
 */
import { Badge } from "@shared/components/ui/Badge";
import { DataTableColumnHeader, DT } from "@shared/lib/data-table";
import type { DataTableColumnDef, DataTableConfig } from "@shared/lib/data-table/data-table.types";
import { useQuery } from "@tanstack/react-query";
import type { Country } from "../demo-showcase.types";

const regionOptions = [
  { label: "Africa", value: "Africa" },
  { label: "Americas", value: "Americas" },
  { label: "Asia", value: "Asia" },
  { label: "Europe", value: "Europe" },
  { label: "Oceania", value: "Oceania" },
];

const columns: DataTableColumnDef<Country>[] = [
  {
    id: "flag",
    header: "Flag",
    cell: ({ row }) => (
      <img
        src={row.original.flags.png}
        alt={row.original.flags.alt || row.original.name.common}
        className="h-5 w-8 rounded-sm object-cover"
      />
    ),
    enableSorting: false,
    size: 60,
  },
  {
    id: "name",
    accessorFn: (row) => row.name.common,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.original.name.common}</span>
        <p className="text-muted-foreground max-w-[200px] truncate text-xs">
          {row.original.name.official}
        </p>
      </div>
    ),
    meta: { label: "Country" },
  },
  {
    id: "capital",
    accessorFn: (row) => row.capital?.[0] ?? "—",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Capital" />,
    meta: { label: "Capital" },
  },
  {
    id: "region",
    accessorFn: (row) => row.region,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Region" />,
    cell: ({ row }) => <Badge variant="outline">{row.original.region}</Badge>,
    meta: { label: "Region" },
    filterFn: (row, id, filterValues: string[]) => {
      return filterValues.includes(row.getValue(id));
    },
  },
  {
    id: "population",
    accessorFn: (row) => row.population,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Population" />,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.population.toLocaleString()}</span>
    ),
    meta: { label: "Population" },
    filterFn: (row, id, value: [number, number]) => {
      const pop = row.getValue<number>(id);
      const [min, max] = value;
      return pop >= min && pop <= max;
    },
  },
  {
    id: "languages",
    accessorFn: (row) => Object.values(row.languages ?? {}).join(", "),
    header: "Languages",
    cell: ({ row }) => (
      <span className="text-muted-foreground max-w-[200px] truncate text-xs">
        {Object.values(row.original.languages ?? {}).join(", ")}
      </span>
    ),
    meta: { label: "Languages" },
    enableSorting: false,
  },
];

function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,languages",
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch countries: ${res.status}`);
      }
      return res.json() as Promise<Country[]>;
    },
    staleTime: 1000 * 60 * 60, // 1 hour — data rarely changes
  });
}

export function CountriesTable() {
  const { data: countries = [], isLoading, error } = useCountries();

  const config: DataTableConfig<Country> = {
    columns,
    dataSource: {
      mode: "client",
      data: countries,
    },
    toolbar: {
      search: { placeholder: "Search countries..." },
      filters: [
        { column: "region", type: "multi-select", options: regionOptions },
        { column: "population", type: "range", min: 0, max: 1500000000, step: 1000000 },
      ],
      columnToggle: true,
    },
    pagination: { defaultPageSize: 10, pageSizeOptions: [10, 25, 50, 100] },
    enableSorting: true,
    syncWithUrl: false,
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive text-sm">Failed to load countries: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
        <span className="text-muted-foreground ml-3 text-sm">Loading 250 countries...</span>
      </div>
    );
  }

  return (
    <DT.Root config={config} className="space-y-4">
      <p className="text-muted-foreground text-sm">
        <code className="bg-muted rounded px-1 text-xs">mode: "client"</code> — {countries.length}{" "}
        countries loaded once. All search, sort, filter happens client-side. Zero API calls after
        initial load.
      </p>
      <DT.Toolbar />
      <DT.Content />
      <DT.Pagination />
    </DT.Root>
  );
}
