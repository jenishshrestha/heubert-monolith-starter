import { DataTableRangeFilter } from "../DataTableRangeFilter";
import { useDataTableReactive } from "./DataTableContext";

interface CompoundRangeFilterProps {
  column: string;
  title: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
}

/**
 * Context-aware range filter with min/max inputs.
 */
function DataTableCompoundRangeFilter({ column: columnId, ...props }: CompoundRangeFilterProps) {
  const { table } = useDataTableReactive();
  const column = table.getColumn(columnId);

  if (!column) {
    return null;
  }

  return <DataTableRangeFilter column={column} {...props} />;
}

export type { CompoundRangeFilterProps };
export { DataTableCompoundRangeFilter };
