import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@shared/components/ui/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/Popover";
import { Separator } from "@shared/components/ui/Separator";
import { cn } from "@shared/lib/utils";
import type { Column } from "@tanstack/react-table";
import { PlusCircleIcon } from "lucide-react";
import { useDataTableReactive } from "./DataTableContext";

interface SingleFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableSingleFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title: string;
  options: SingleFilterOption[];
}

/**
 * Single-select filter (radio behavior).
 * Only one option can be active at a time.
 * Sets filter value as a single-element array for consistency with faceted filter.
 */
function DataTableSingleFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableSingleFilterProps<TData, TValue>) {
  const filterValue = column?.getFilterValue() as string[] | undefined;
  const selectedValue = filterValue?.[0] ?? null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <PlusCircleIcon className="size-4" />
          {title}
          {selectedValue && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {options.find((o) => o.value === selectedValue)?.label ?? selectedValue}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      // Toggle: click same = deselect, click different = select
                      if (isSelected) {
                        column?.setFilterValue(undefined);
                      } else {
                        column?.setFilterValue([option.value]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "border-primary flex size-4 items-center justify-center rounded-full border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <div className="size-1.5 rounded-full bg-current" />
                    </div>
                    {option.icon && <option.icon className="text-muted-foreground size-4" />}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValue && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---- Compound wrapper ----

function CompoundSingleFilter({
  column: columnId,
  title,
  options,
}: {
  column: string;
  title: string;
  options: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}) {
  const { table } = useDataTableReactive();
  const column = table.getColumn(columnId);
  if (!column) {
    return null;
  }
  return <DataTableSingleFilter column={column} title={title} options={options} />;
}

export type { DataTableSingleFilterProps, SingleFilterOption };
export { CompoundSingleFilter, DataTableSingleFilter };
