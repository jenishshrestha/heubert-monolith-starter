import type { DataProvider } from "./data-provider.types";

export type DataProviderMiddleware = (next: DataProvider) => DataProvider;

/**
 * Compose middlewares left-to-right. First middleware is outermost.
 *
 * ```ts
 * applyMiddleware([logging, retry, errorNormalizer], baseProvider)
 * // => logging(retry(errorNormalizer(baseProvider)))
 * ```
 */
export function applyMiddleware(
  middlewares: DataProviderMiddleware[],
  provider: DataProvider,
): DataProvider {
  return middlewares.reduceRight((wrapped, mw) => mw(wrapped), provider);
}
