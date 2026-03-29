import { Button } from "@shared/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/DropdownMenu";
import type { Table } from "@tanstack/react-table";
import { Columns3Icon } from "lucide-react";
import { useDataTableInstance } from "./DataTableContext";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          Columns
          <Columns3Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {(column.columnDef.meta as { label?: string } | undefined)?.label ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---- Compound wrapper ----

function CompoundViewOptions() {
  const { table } = useDataTableInstance();
  return <DataTableViewOptions table={table} />;
}

export type { DataTableViewOptionsProps };
export { CompoundViewOptions, DataTableViewOptions };
