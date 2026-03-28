import { createContext, type ReactNode, useContext } from "react";
import type { DataTableAdapter } from "../types/data-table.types";

// Store adapter directly — not wrapped in { adapter }.
// Wrapping creates a new object on every render at the root level.
const DataTableContext = createContext<DataTableAdapter | null>(null);

export function DataTableProvider({
  adapter,
  children,
}: {
  adapter: DataTableAdapter;
  children: ReactNode;
}) {
  return <DataTableContext.Provider value={adapter}>{children}</DataTableContext.Provider>;
}

export function useDataTableAdapter(): DataTableAdapter | null {
  return useContext(DataTableContext);
}
