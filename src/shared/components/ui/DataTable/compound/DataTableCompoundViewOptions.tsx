import { DataTableViewOptions } from "../DataTableViewOptions";
import { useDataTableInstance } from "./DataTableContext";

/**
 * Context-aware column visibility options. Reads from StableContext only —
 * does NOT re-render on row selection, search, or pagination changes.
 */
function DataTableCompoundViewOptions() {
  const { table } = useDataTableInstance();

  return <DataTableViewOptions table={table} />;
}

export { DataTableCompoundViewOptions };
