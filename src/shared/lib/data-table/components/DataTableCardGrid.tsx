import { cn } from "@shared/lib/utils";
import type { Table } from "@tanstack/react-table";
import type * as React from "react";

interface DataTableCardGridProps<TData> {
  table: Table<TData>;
  cardRenderer: (
    row: TData,
    options: { isSelected: boolean; onSelect: (selected: boolean) => void },
  ) => React.ReactNode;
  isFetching?: boolean;
  className?: string;
}

function DataTableCardGrid<TData>({
  table,
  cardRenderer,
  isFetching,
  className,
}: DataTableCardGridProps<TData>) {
  return (
    <div className={cn("relative", className)}>
      {isFetching && (
        <div
          role="status"
          aria-label="Loading"
          className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center rounded-md"
        >
          <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {table.getRowModel().rows.map((row) =>
          cardRenderer(row.original, {
            isSelected: row.getIsSelected(),
            onSelect: (selected) => row.toggleSelected(selected),
          }),
        )}
      </div>
    </div>
  );
}

export type { DataTableCardGridProps };
export { DataTableCardGrid };
