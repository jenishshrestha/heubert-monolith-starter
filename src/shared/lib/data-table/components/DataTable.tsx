import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/Table";

import { cn } from "@shared/lib/utils";
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  isFetching?: boolean;
  className?: string;
}

function DataTable<TData>({ table, isFetching, className }: DataTableProps<TData>) {
  return (
    <div className={cn("relative rounded-md border", className)}>
      {isFetching && (
        <div
          role="status"
          aria-label="Loading"
          className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60"
        >
          <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export type { DataTableProps };
export { DataTable };
