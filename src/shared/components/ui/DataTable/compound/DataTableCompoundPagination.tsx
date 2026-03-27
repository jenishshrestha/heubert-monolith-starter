import { DataTablePagination } from "../DataTablePagination";
import { useDataTableInstance, useDataTableReactive } from "./DataTableContext";

interface CompoundPaginationProps {
  pageSizeOptions?: number[];
}

/**
 * Context-aware pagination. Reads pageSizeOptions from config when not explicitly passed.
 */
function DataTableCompoundPagination({ pageSizeOptions }: CompoundPaginationProps) {
  const { table } = useDataTableReactive();
  const { config } = useDataTableInstance();

  return (
    <DataTablePagination
      table={table}
      pageSizeOptions={pageSizeOptions ?? config.pagination?.pageSizeOptions}
    />
  );
}

export { DataTableCompoundPagination };
