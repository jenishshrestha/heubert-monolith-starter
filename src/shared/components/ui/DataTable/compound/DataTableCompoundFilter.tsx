import { DataTableFacetedFilter } from "../DataTableFacetedFilter";
import { useDataTableReactive } from "./DataTableContext";

interface CompoundFilterProps {
  /** Column ID to filter on. */
  column: string;
  title: string;
  options: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

/**
 * Context-aware faceted filter. Reads from ReactiveContext —
 * needs to re-render when filter state changes to show checked/unchecked state.
 */
function DataTableCompoundFilter({ column: columnId, title, options }: CompoundFilterProps) {
  const { table } = useDataTableReactive();
  const column = table.getColumn(columnId);

  if (!column) {
    return null;
  }

  return <DataTableFacetedFilter column={column} title={title} options={options} />;
}

export type { CompoundFilterProps };
export { DataTableCompoundFilter };
