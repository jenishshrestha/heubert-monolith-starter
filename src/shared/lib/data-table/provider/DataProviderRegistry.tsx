import { createContext, type ReactNode, useContext } from "react";
import type { DataProvider } from "./data-provider.types";

// Store the provider directly — not wrapped in { provider }.
// Wrapping creates a new object on every render, causing all consumers to re-render.
const DataProviderContext = createContext<DataProvider | null>(null);

interface DataProviderRegistryProps {
  provider: DataProvider;
  children: ReactNode;
}

export function DataProviderRegistry({ provider, children }: DataProviderRegistryProps) {
  return <DataProviderContext.Provider value={provider}>{children}</DataProviderContext.Provider>;
}

export function useDataProvider(): DataProvider | null {
  return useContext(DataProviderContext);
}
