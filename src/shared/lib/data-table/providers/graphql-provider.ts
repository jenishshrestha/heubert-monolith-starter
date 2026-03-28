import type { DataProvider, GetListParams, GetListResponse } from "../provider/data-provider.types";
import { resolveHeaders } from "../provider/utils";

export interface GraphQLResourceConfig {
  /** The GraphQL query string. */
  query: string;
  /** Build variables from GetListParams. */
  variables: (params: GetListParams) => Record<string, unknown>;
  /** Transform the raw GraphQL response data into GetListResponse. */
  transformResponse: (data: unknown) => GetListResponse<unknown>;
}

export interface GraphQLProviderOptions {
  /** The GraphQL endpoint URL. */
  endpoint: string;
  /** Custom fetch function (defaults to globalThis.fetch). */
  httpClient?: (url: string, init: RequestInit) => Promise<Response>;
  /** Static or dynamic headers (e.g., auth tokens). */
  headers?: Record<string, string> | (() => Record<string, string>);
  /** Per-resource query configuration. Key is the resource name. */
  resources: Record<string, GraphQLResourceConfig>;
}

/**
 * Creates a DataProvider that executes GraphQL queries.
 * Each resource must have its own query, variables builder, and response transformer.
 */
export function createGraphQLProvider(options: GraphQLProviderOptions): DataProvider {
  const {
    endpoint,
    httpClient = globalThis.fetch.bind(globalThis),
    headers: headerConfig,
    resources,
  } = options;

  return {
    async getList<TData>(params: GetListParams): Promise<GetListResponse<TData>> {
      const resourceConfig = resources[params.resource];
      if (!resourceConfig) {
        throw new Error(
          `GraphQL provider: no configuration for resource "${params.resource}". ` +
            `Available: ${Object.keys(resources).join(", ")}`,
        );
      }

      const variables = resourceConfig.variables(params);
      const headers = resolveHeaders(headerConfig);

      const response = await httpClient(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ query: resourceConfig.query, variables }),
        signal: params.signal,
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const json = (await response.json()) as {
        data?: unknown;
        errors?: Array<{ message: string }>;
      };

      if (Array.isArray(json.errors) && json.errors.length > 0) {
        throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`);
      }

      return resourceConfig.transformResponse(json.data) as GetListResponse<TData>;
    },
  };
}
