import { normalizeError } from "../provider/data-provider-error";
import type { DataProviderMiddleware } from "../provider/data-provider-middleware";

/**
 * Catches any thrown error and wraps it in a standardized DataProviderError.
 */
export function errorNormalizerMiddleware(): DataProviderMiddleware {
  return (next) => ({
    async getList(params) {
      try {
        return await next.getList(params);
      } catch (err) {
        throw normalizeError(err);
      }
    },
  });
}
