import { Button } from "@shared/components/ui/Button";

import {
  DataTable,
  DataTableBulkBar,
  DataTableCardGrid,
  DataTableEmpty,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableSkeleton,
  DataTableToolbar,
  DataTableViewToggle,
} from "@shared/components/ui/DataTable";
import { exportCurrentPage, exportSelectedRows, useDataTable } from "@shared/lib/data-table";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { usersTableConfig } from "./api/users-table.config";
import { userColumns } from "./lib/columns";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export function DemoTablePage() {
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
  } = useDataTable(usersTableConfig);

  return (
    <main className="bg-background min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground text-sm">
              Config-driven DataTable demo powered by DummyJSON API.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataTableViewToggle
              view={view}
              onViewChange={setView}
              availableViews={availableViews}
            />
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
        </div>

        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Search users..."
          filterSlot={
            <DataTableFacetedFilter
              column={table.getColumn("gender")}
              title="Gender"
              options={genderOptions}
            />
          }
        />

        <div className="space-y-4">
          {isLoading ? (
            <DataTableSkeleton columnCount={userColumns.length + 2} rowCount={10} />
          ) : isEmpty ? (
            <DataTableEmpty title="No users found" description="Try adjusting your filters." />
          ) : view === "table" ? (
            <DataTable table={table} isFetching={isFetching} />
          ) : (
            <DataTableCardGrid
              table={table}
              cardRenderer={usersTableConfig.cardRenderer!}
              isFetching={isFetching}
            />
          )}
          <DataTablePagination table={table} />
        </div>

        <DataTableBulkBar table={table}>
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
        </DataTableBulkBar>
      </div>
    </main>
  );
}
