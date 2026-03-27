import { Button } from "@shared/components/ui/Button";
import { DT, useDataTableContext } from "@shared/components/ui/DataTable";
import {
  createRestProvider,
  createSelectionColumn,
  exportCurrentPage,
  exportSelectedRows,
} from "@shared/lib/data-table";
import type { DataTableConfig } from "@shared/lib/data-table/data-table.types";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { UserCard } from "./components/UserCard";
import type { User } from "./demo-table.types";
import { userColumns } from "./lib/columns";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

/**
 * Per-table REST provider configured for DummyJSON's API format.
 * Demonstrates how to override the global provider for a specific table.
 */
const dummyJsonProvider = createRestProvider({
  pagination: { style: "offset", skipParam: "skip", limitParam: "limit" },
  sort: { style: "flat", sortByParam: "sortBy", orderParam: "order" },
  response: { dataPath: "users", totalPath: "total" },
  staticParams: {
    select: "id,firstName,lastName,email,age,gender,phone,birthDate,image,university",
  },
});

const usersProviderConfig: DataTableConfig<User> = {
  columns: [createSelectionColumn<User>(), ...userColumns],
  cardRenderer: (user, { isSelected, onSelect }) => (
    <UserCard key={user.id} user={user} isSelected={isSelected} onSelect={onSelect} />
  ),
  dataSource: {
    mode: "provider",
    resource: "https://dummyjson.com/users/search",
    provider: dummyJsonProvider,
    paginationType: "offset",
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 50],
  },
  search: {
    enabled: true,
    placeholder: "Search users...",
  },
  enableSorting: true,
  enableRowSelection: true,
  syncWithUrl: true,
};

function ToolbarActions() {
  const { table } = useDataTableContext<User>();

  return (
    <div className="flex items-center gap-2">
      <DT.ViewToggle />
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={() => exportCurrentPage(table, { filename: "users" })}
      >
        <DownloadIcon className="size-4" />
        Export CSV
      </Button>
    </div>
  );
}

function BulkActions() {
  const { table } = useDataTableContext<User>();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportSelectedRows(table, { filename: "users-selected" })}
      >
        <DownloadIcon className="size-4" />
        Export
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => alert(`Delete ${table.getFilteredSelectedRowModel().rows.length} users`)}
      >
        <TrashIcon className="size-4" />
        Delete
      </Button>
    </>
  );
}

export function DemoTableCompoundPage() {
  return (
    <main className="bg-background min-h-screen p-6 md:p-10">
      <DT.Root config={usersProviderConfig} className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Users (Compound)</h1>
            <p className="text-muted-foreground text-sm">
              Compound composition demo with DataProvider.
            </p>
          </div>
          <ToolbarActions />
        </div>

        <DT.Toolbar>
          <DT.Search placeholder="Search users..." />
          <DT.Filter column="gender" title="Gender" options={genderOptions} />
        </DT.Toolbar>

        <DT.Content />

        <DT.Pagination />

        <DT.BulkBar>
          <BulkActions />
        </DT.BulkBar>
      </DT.Root>
    </main>
  );
}
