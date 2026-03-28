// ---- Individual components (prop-based, existing API) ----
export * from "./compound";
export * from "./DataTable";
export * from "./DataTableBulkBar";
export * from "./DataTableCardGrid";
export * from "./DataTableColumnHeader";
export * from "./DataTableEmpty";
export * from "./DataTableFacetedFilter";
export * from "./DataTablePagination";
export * from "./DataTableRangeFilter";
export * from "./DataTableRowActions";
export * from "./DataTableSearch";
export * from "./DataTableSingleFilter";
export * from "./DataTableSkeleton";
export * from "./DataTableToolbar";
export * from "./DataTableViewOptions";
export * from "./DataTableViewToggle";

// ---- Compound composition API ----
import { DataTableCompoundBulkBar } from "./compound/DataTableCompoundBulkBar";
import { DataTableCompoundFilter } from "./compound/DataTableCompoundFilter";
import { DataTableCompoundPagination } from "./compound/DataTableCompoundPagination";
import { DataTableCompoundRangeFilter } from "./compound/DataTableCompoundRangeFilter";
import { DataTableCompoundSearch } from "./compound/DataTableCompoundSearch";
import { DataTableCompoundSingleFilter } from "./compound/DataTableCompoundSingleFilter";
import { DataTableCompoundToolbar } from "./compound/DataTableCompoundToolbar";
import { DataTableCompoundViewOptions } from "./compound/DataTableCompoundViewOptions";
import { DataTableCompoundViewToggle } from "./compound/DataTableCompoundViewToggle";
import { DataTableContent } from "./compound/DataTableContent";
import { DataTableRoot } from "./compound/DataTableRoot";

/**
 * Compound composition namespace.
 *
 * Filter types:
 * - `DT.Filter`       — multi-select (checkbox)
 * - `DT.SingleFilter` — single-select (radio)
 * - `DT.RangeFilter`  — min/max number range
 */
export const DT = {
  Root: DataTableRoot,
  Content: DataTableContent,
  Toolbar: DataTableCompoundToolbar,
  Search: DataTableCompoundSearch,
  Filter: DataTableCompoundFilter,
  SingleFilter: DataTableCompoundSingleFilter,
  RangeFilter: DataTableCompoundRangeFilter,
  Pagination: DataTableCompoundPagination,
  BulkBar: DataTableCompoundBulkBar,
  ViewToggle: DataTableCompoundViewToggle,
  ViewOptions: DataTableCompoundViewOptions,
};
