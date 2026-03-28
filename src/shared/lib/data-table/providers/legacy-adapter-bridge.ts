import type { DataTableAdapter } from "../data-table.types";
import type { DataProvider } from "../provider/data-provider.types";
import { createRestProvider, type RestProviderOptions } from "./rest-provider";

/**
 * Wraps an old DataTableAdapter into the new DataProvider interface.
 * Use this to migrate existing custom adapters without rewriting them.
 *
 * The adapter is plugged in as the HTTP transport layer of a REST provider.
 */
export function createLegacyBridge(
  adapter: DataTableAdapter,
  options: Omit<RestProviderOptions, "httpClient"> = {},
): DataProvider {
  return createRestProvider({
    ...options,
    httpClient: async (url: string, init: RequestInit): Promise<Response> => {
      const method = (init.method as "GET" | "POST") ?? "GET";
      let body: Record<string, unknown> | undefined;
      if (init.body) {
        try {
          body = JSON.parse(init.body as string);
        } catch {
          body = undefined;
        }
      }
      const raw = await adapter.fetch({
        url,
        method,
        headers: init.headers as Record<string, string>,
        body,
        signal: init.signal ?? undefined,
      });

      return new Response(JSON.stringify(raw), {
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
      });
    },
  });
}
