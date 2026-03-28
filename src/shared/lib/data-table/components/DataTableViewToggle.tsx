import { Toggle } from "@shared/components/ui/Toggle";
import { LayoutGridIcon, TableIcon } from "lucide-react";
import type { DataTableView } from "../types/data-table.types";
import { useDataTableView } from "./DataTableContext";

interface DataTableViewToggleProps {
  view: DataTableView;
  onViewChange: (view: DataTableView) => void;
  availableViews: DataTableView[];
}

function DataTableViewToggle({ view, onViewChange, availableViews }: DataTableViewToggleProps) {
  if (availableViews.length < 2) {
    return null;
  }

  return (
    <div className="border-border flex items-center rounded-md border">
      {availableViews.includes("table") && (
        <Toggle
          size="sm"
          pressed={view === "table"}
          onPressedChange={() => onViewChange("table")}
          aria-label="Table view"
          className="rounded-r-none border-0"
        >
          <TableIcon className="size-4" />
          Table
        </Toggle>
      )}
      {availableViews.includes("card") && (
        <Toggle
          size="sm"
          pressed={view === "card"}
          onPressedChange={() => onViewChange("card")}
          aria-label="Card view"
          className="rounded-l-none border-0"
        >
          <LayoutGridIcon className="size-4" />
          Cards
        </Toggle>
      )}
    </div>
  );
}

// ---- Compound wrapper ----

function CompoundViewToggle() {
  const { view, setView, availableViews } = useDataTableView();
  return <DataTableViewToggle view={view} onViewChange={setView} availableViews={availableViews} />;
}

export type { DataTableViewToggleProps };
export { CompoundViewToggle, DataTableViewToggle };
