// ---- Components (prop-based) ----
export * from "./DataTable";
export * from "./DataTableAdvancedFilter";
export * from "./DataTableBulkBar";
export * from "./DataTableCardGrid";
export * from "./DataTableColumnHeader";
export * from "./DataTableContent";
export * from "./DataTableContext";
export * from "./DataTableEmpty";
export * from "./DataTableFacetedFilter";
export * from "./DataTableFilterTags";
export * from "./DataTablePagination";
export * from "./DataTableRangeFilter";
export * from "./DataTableRoot";
export * from "./DataTableRowActions";
export * from "./DataTableSearch";
export * from "./DataTableSingleFilter";
export * from "./DataTableSkeleton";
export * from "./DataTableToolbar";
export * from "./DataTableViewOptions";
export * from "./DataTableViewToggle";
export * from "./selection-column";

// ---- Compound composition namespace ----
import { CompoundAdvancedFilter } from "./DataTableAdvancedFilter";
import { CompoundBulkBar } from "./DataTableBulkBar";
import { DataTableContent } from "./DataTableContent";
import { CompoundFilter } from "./DataTableFacetedFilter";
import { CompoundFilterTags } from "./DataTableFilterTags";
import { CompoundPagination } from "./DataTablePagination";
import { CompoundRangeFilter } from "./DataTableRangeFilter";
import { DataTableRoot } from "./DataTableRoot";
import { CompoundSearch } from "./DataTableSearch";
import { CompoundSingleFilter } from "./DataTableSingleFilter";
import { CompoundToolbar } from "./DataTableToolbar";
import { CompoundViewOptions } from "./DataTableViewOptions";
import { CompoundViewToggle } from "./DataTableViewToggle";

export const DT = {
  Root: DataTableRoot,
  Content: DataTableContent,
  Toolbar: CompoundToolbar,
  Search: CompoundSearch,
  Filter: CompoundFilter,
  SingleFilter: CompoundSingleFilter,
  RangeFilter: CompoundRangeFilter,
  AdvancedFilter: CompoundAdvancedFilter,
  FilterTags: CompoundFilterTags,
  Pagination: CompoundPagination,
  BulkBar: CompoundBulkBar,
  ViewToggle: CompoundViewToggle,
  ViewOptions: CompoundViewOptions,
};
