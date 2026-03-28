import type { Table } from "@tanstack/react-table";
import { createContext, useContext } from "react";
import type { DataTableConfig, DataTableView } from "../types/data-table.types";

// ---- Focused context slices ----
// Split into 4 contexts so components only re-render when their specific data changes.
// Row selection change → only ReactiveContext updates → Search/ViewToggle/Filter stay still.

/** Stable refs: table instance, config, action callbacks. Rarely changes reference. */
export interface DataTableStableValue<TData = unknown> {
  table: Table<TData>;
  config: DataTableConfig<TData>;
  setGlobalFilter: (value: string) => void;
  setView: (view: DataTableView) => void;
  availableViews: DataTableView[];
}

/** Search state. Changes only when the user types in search. */
export interface DataTableSearchValue {
  globalFilter: string;
}

/** View state. Changes only when the user toggles table/card view. */
export interface DataTableViewValue {
  view: DataTableView;
}

/**
 * Reactive state. Changes on ANY table state change (row selection, sort, pagination, fetch).
 * Components that render table data subscribe to this.
 */
export interface DataTableReactiveValue<TData = unknown> {
  table: Table<TData>;
  isLoading: boolean;
  isFetching: boolean;
  isEmpty: boolean;
  data: TData[];
  totalRows: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ---- Context instances ----

const StableCtx = createContext<DataTableStableValue | null>(null);
const SearchCtx = createContext<DataTableSearchValue | null>(null);
const ViewCtx = createContext<DataTableViewValue | null>(null);
const ReactiveCtx = createContext<DataTableReactiveValue | null>(null);

export { ReactiveCtx, SearchCtx, StableCtx, ViewCtx };

// ---- Focused hooks (subscribe to ONE context) ----

function assertContext<T>(ctx: T | null, name: string): T {
  if (!ctx) {
    throw new Error(`${name} must be used within a <DataTable.Root> component.`);
  }
  return ctx;
}

/** Table instance, config, and action callbacks. Stable — rarely triggers re-render. */
export function useDataTableInstance<TData = unknown>(): DataTableStableValue<TData> {
  return assertContext(
    useContext(StableCtx),
    "useDataTableInstance",
  ) as DataTableStableValue<TData>;
}

/** Global search filter. Only re-renders when search text changes. */
export function useDataTableSearch(): DataTableSearchValue & {
  setGlobalFilter: (v: string) => void;
} {
  const search = assertContext(useContext(SearchCtx), "useDataTableSearch");
  const stable = assertContext(useContext(StableCtx), "useDataTableSearch");
  return { globalFilter: search.globalFilter, setGlobalFilter: stable.setGlobalFilter };
}

/** View state. Only re-renders when view toggles. */
export function useDataTableView(): DataTableViewValue & {
  setView: (v: DataTableView) => void;
  availableViews: DataTableView[];
} {
  const view = assertContext(useContext(ViewCtx), "useDataTableView");
  const stable = assertContext(useContext(StableCtx), "useDataTableView");
  return { view: view.view, setView: stable.setView, availableViews: stable.availableViews };
}

/** Loading/data status + table for rendering. Re-renders on any table state change. */
export function useDataTableReactive<TData = unknown>(): DataTableReactiveValue<TData> {
  return assertContext(
    useContext(ReactiveCtx),
    "useDataTableReactive",
  ) as DataTableReactiveValue<TData>;
}

// ---- Combined hook (backward compat + custom components) ----
// Subscribes to ALL contexts — use focused hooks above for better performance.

export interface DataTableContextValue<TData = unknown> {
  table: Table<TData>;
  config: DataTableConfig<TData>;
  isLoading: boolean;
  isFetching: boolean;
  isEmpty: boolean;
  data: TData[];
  totalRows: number;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  view: DataTableView;
  setView: (view: DataTableView) => void;
  availableViews: DataTableView[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useDataTableContext<TData = unknown>(): DataTableContextValue<TData> {
  const stable = assertContext(
    useContext(StableCtx),
    "useDataTableContext",
  ) as DataTableStableValue<TData>;
  const search = assertContext(useContext(SearchCtx), "useDataTableContext");
  const view = assertContext(useContext(ViewCtx), "useDataTableContext");
  const reactive = assertContext(
    useContext(ReactiveCtx),
    "useDataTableContext",
  ) as DataTableReactiveValue<TData>;

  return {
    table: reactive.table,
    config: stable.config,
    isLoading: reactive.isLoading,
    isFetching: reactive.isFetching,
    isEmpty: reactive.isEmpty,
    data: reactive.data,
    totalRows: reactive.totalRows,
    globalFilter: search.globalFilter,
    setGlobalFilter: stable.setGlobalFilter,
    view: view.view,
    setView: stable.setView,
    availableViews: stable.availableViews,
    hasNextPage: reactive.hasNextPage,
    hasPreviousPage: reactive.hasPreviousPage,
  };
}
