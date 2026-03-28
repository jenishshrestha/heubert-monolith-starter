import { apiClient } from "@shared/lib/api/client";
import type { AxiosInstance } from "axios";
import type { DataTableAdapter } from "../types/data-table.types";

export interface RestAdapterOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  client?: AxiosInstance;
}

export function createRestAdapter(options?: RestAdapterOptions): DataTableAdapter {
  const client = options?.client ?? apiClient;
  const baseUrl = options?.baseUrl;
  const defaultHeaders = options?.headers;

  return {
    async fetch(request) {
      const fullUrl = baseUrl ? `${baseUrl}${request.url}` : request.url;
      const headers = { ...defaultHeaders, ...request.headers };

      const response =
        request.method === "POST"
          ? await client.post(fullUrl, request.body, { headers, signal: request.signal })
          : await client.get(fullUrl, { headers, signal: request.signal });

      return response.data;
    },
  };
}
