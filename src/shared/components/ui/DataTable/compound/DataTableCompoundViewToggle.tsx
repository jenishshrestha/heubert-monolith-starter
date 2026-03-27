import { DataTableViewToggle } from "../DataTableViewToggle";
import { useDataTableView } from "./DataTableContext";

/**
 * Context-aware view toggle. Reads from ViewContext only —
 * does NOT re-render on row selection, search, or pagination changes.
 */
function DataTableCompoundViewToggle() {
  const { view, setView, availableViews } = useDataTableView();

  return <DataTableViewToggle view={view} onViewChange={setView} availableViews={availableViews} />;
}

export { DataTableCompoundViewToggle };
