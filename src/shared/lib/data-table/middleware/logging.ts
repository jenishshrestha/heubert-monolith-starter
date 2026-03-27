import type { DataProviderMiddleware } from "../provider/data-provider-middleware";

/**
 * Logs resource name, timing, and row count for every getList call.
 */
export function loggingMiddleware(): DataProviderMiddleware {
  return (next) => ({
    async getList(params) {
      const start = performance.now();
      try {
        const result = await next.getList(params);
        const ms = (performance.now() - start).toFixed(1);
        console.debug(
          `[DataProvider] ${params.resource} getList: ${ms}ms, ${result.data.length} rows`,
        );
        return result;
      } catch (err) {
        const ms = (performance.now() - start).toFixed(1);
        console.error(`[DataProvider] ${params.resource} getList failed (${ms}ms)`, err);
        throw err;
      }
    },
  });
}
