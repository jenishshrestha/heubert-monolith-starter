import { useMemo, useRef } from "react";
import { useDataProvider } from "../core/DataProviderRegistry";
import { useDataTableAdapter } from "../core/DataTableProvider";
import { resolveDataSource } from "../core/resolveDataSource";
import { resolveProviderDataSource } from "../core/resolveProviderDataSource";
import type {
  DataSource,
  DataTableQueryParams,
  DataTableServerResponse,
} from "../types/data-table.types";

export interface ResolvedDataSource<TData> {
  mode: "server" | "client";
  queryKey: readonly unknown[];
  queryFn: (params: DataTableQueryParams) => Promise<DataTableServerResponse<TData>>;
  data: TData[];
  isCursorMode: boolean;
}

export function useDataSource<TData>(dataSource: DataSource<TData>): ResolvedDataSource<TData> {
  const contextAdapter = useDataTableAdapter();
  const contextProvider = useDataProvider();
  const cursorMapRef = useRef(new Map<number, string>());

  return useMemo(() => {
    if (dataSource.mode === "provider") {
      const provider = dataSource.provider ?? contextProvider;
      if (!provider) {
        throw new Error(
          "DataTable: mode is 'provider' but no DataProvider found. " +
            "Either pass `provider` in dataSource config or wrap your app with <DataProviderRegistry>.",
        );
      }

      const resolved = resolveProviderDataSource<TData>(
        {
          resource: dataSource.resource,
          provider,
          paginationType: dataSource.paginationType ?? "offset",
          queryKey: dataSource.queryKey ?? [dataSource.resource],
          meta: dataSource.meta,
        },
        cursorMapRef.current,
      );

      return {
        mode: resolved.mode,
        queryKey: resolved.queryKey,
        queryFn: resolved.queryFn,
        data: [] as TData[],
        isCursorMode: dataSource.paginationType === "cursor",
      };
    }

    const resolved = resolveDataSource(dataSource, contextAdapter);

    if (resolved.mode === "server") {
      return {
        mode: "server" as const,
        queryKey: resolved.queryKey,
        queryFn: resolved.queryFn,
        data: [] as TData[],
        isCursorMode: false,
      };
    }

    return {
      mode: "client" as const,
      queryKey: [] as unknown[],
      queryFn: noopQueryFn as (
        params: DataTableQueryParams,
      ) => Promise<DataTableServerResponse<TData>>,
      data: resolved.data,
      isCursorMode: false,
    };
  }, [dataSource, contextAdapter, contextProvider]);
}

/** Noop queryFn for client mode — never called due to enabled: false */
export const noopQueryFn = () => Promise.resolve({ data: [] as never[], total: 0 });
