import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Input } from "@shared/components/ui/Input";
import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import {
  useDataTableAdvancedFilters,
  useDataTableInstance,
  useDataTableSearch,
} from "./DataTableContext";

// Heavy sheet (Sheet + CheckboxAccordion + HierarchicalCheckboxGroup) — split out.
const DataTableAdvancedFilterSheet = lazy(() =>
  import("./DataTableAdvancedFilterSheet").then((m) => ({
    default: m.DataTableAdvancedFilterSheet,
  })),
);

interface DataTableFilterBarProps {
  searchPlaceholder?: string;
  sheetTitle?: string;
  sheetDescription?: string;
  className?: string;
  /** Slot for quick filters rendered between search input and Filters button. */
  children?: React.ReactNode;
}

/**
 * Combined search input + advanced-filter trigger.
 * Wires into DataTable context — search goes through setGlobalFilter,
 * advanced filters through useDataTableAdvancedFilters.
 *
 * Only renders the advanced-filter button when config.advancedFilters is set.
 */
export function DataTableFilterBar({
  searchPlaceholder = "Search...",
  sheetTitle,
  sheetDescription,
  className,
  children,
}: DataTableFilterBarProps) {
  const { globalFilter, setGlobalFilter } = useDataTableSearch();
  const advanced = useDataTableAdvancedFilters();
  const { config } = useDataTableInstance();
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasAdvanced = Boolean(config.advancedFilters);
  const hasActive = advanced.activeCount > 0 || globalFilter.length > 0;

  function clearAll() {
    advanced.clearAll();
    setGlobalFilter("");
  }

  return (
    <>
      <div className={className ?? "flex flex-wrap items-center gap-2"}>
        <div className="relative min-w-0 flex-1 sm:flex-none sm:w-80">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>

        {children}

        {hasAdvanced && (
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            <FilterIcon className="size-4" />
            Filters
            {advanced.activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5">
                {advanced.activeCount}
              </Badge>
            )}
          </Button>
        )}

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <XIcon className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {hasAdvanced && sheetOpen && (
        <Suspense fallback={null}>
          <DataTableAdvancedFilterSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            title={sheetTitle}
            description={sheetDescription}
          />
        </Suspense>
      )}
    </>
  );
}
