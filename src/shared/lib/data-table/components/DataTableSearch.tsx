import { Button } from "@shared/components/ui/Button";
import { Input } from "@shared/components/ui/Input";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDataTableSearch } from "./DataTableContext";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

function DataTableSearch({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
}: DataTableSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync from parent without useEffect — derived state during render
  const prevValueRef = useRef(value);
  if (prevValueRef.current !== value) {
    prevValueRef.current = value;
    setLocalValue(value);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  return (
    <div className="relative w-full max-w-xs">
      <SearchIcon className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="h-9 pl-8 pr-8"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
          onClick={() => {
            setLocalValue("");
            onChange("");
          }}
        >
          <XIcon className="size-3" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}

// ---- Compound wrapper ----

function CompoundSearch(
  props: Omit<DataTableSearchProps, "value" | "onChange"> & {
    value?: string;
    onChange?: (v: string) => void;
  },
) {
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

export type { DataTableSearchProps };
export { CompoundSearch, DataTableSearch };
