import type { AxiosInstance } from "axios";
import type { DataProvider } from "../provider/data-provider.types";
import { createRestProvider, type RestProviderOptions } from "./rest-provider";

export interface AxiosProviderOptions extends Omit<RestProviderOptions, "httpClient"> {
  /** Axios instance to use. Must be pre-configured with interceptors, auth, etc. */
  client: AxiosInstance;
}

/**
 * Creates a DataProvider backed by an Axios instance.
 * Preserves all Axios interceptors (auth, error handling, etc.).
 */
export function createAxiosProvider(
  client: AxiosInstance,
  options: Omit<AxiosProviderOptions, "client"> = {},
): DataProvider {
  return createRestProvider({
    ...options,
    httpClient: async (url: string, init: RequestInit): Promise<Response> => {
      const response = await client.request({
        url,
        method: (init.method as string) ?? "GET",
        headers: init.headers as Record<string, string>,
        signal: init.signal ?? undefined,
      });

      // Wrap Axios response as a fetch-compatible Response for the REST provider
      const body =
        typeof response.data === "string" ? response.data : JSON.stringify(response.data);
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers as Record<string, string>),
      });
    },
  });
}
