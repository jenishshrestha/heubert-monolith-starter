import { DataTableSearch, type DataTableSearchProps } from "../DataTableSearch";
import { useDataTableSearch } from "./DataTableContext";

type CompoundSearchProps = Omit<DataTableSearchProps, "value" | "onChange"> & {
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * Context-aware search. Reads from SearchContext only —
 * does NOT re-render on row selection, pagination, or sort changes.
 */
function DataTableCompoundSearch(props: CompoundSearchProps) {
  const { globalFilter, setGlobalFilter } = useDataTableSearch();

  return (
    <DataTableSearch
      value={props.value ?? globalFilter}
      onChange={props.onChange ?? setGlobalFilter}
      placeholder={props.placeholder}
      debounceMs={props.debounceMs}
    />
  );
}

export { DataTableCompoundSearch };
