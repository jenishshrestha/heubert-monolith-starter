import { DataTableSingleFilter } from "../DataTableSingleFilter";
import { useDataTableReactive } from "./DataTableContext";

interface CompoundSingleFilterProps {
  column: string;
  title: string;
  options: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

/**
 * Context-aware single-select filter (radio behavior).
 */
function DataTableCompoundSingleFilter({
  column: columnId,
  title,
  options,
}: CompoundSingleFilterProps) {
  const { table } = useDataTableReactive();
  const column = table.getColumn(columnId);

  if (!column) {
    return null;
  }

  return <DataTableSingleFilter column={column} title={title} options={options} />;
}

export type { CompoundSingleFilterProps };
export { DataTableCompoundSingleFilter };
