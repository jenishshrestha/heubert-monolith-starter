import type { DataProviderMiddleware } from "../provider/data-provider-middleware";

export interface RetryOptions {
  /** Maximum number of retries (default: 2). */
  maxRetries?: number;
  /** Base delay in ms between retries (default: 1000). Doubles each attempt. */
  delay?: number;
  /** Only retry on these status codes (default: [500, 502, 503, 504]). */
  retryOnStatus?: number[];
}

function isRetryable(err: unknown, retryOnStatus: number[]): boolean {
  if (typeof err === "object" && err !== null && "statusCode" in err) {
    return retryOnStatus.includes((err as { statusCode: number }).statusCode);
  }
  if (err instanceof Error) {
    const match = err.message.match(/fetch failed: (\d{3})/);
    if (match) {
      return retryOnStatus.includes(Number(match[1]));
    }
  }
  // Retry on network errors
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return true;
  }
  return false;
}

/**
 * Retries failed getList calls with exponential backoff.
 */
export function retryMiddleware(options: RetryOptions = {}): DataProviderMiddleware {
  const { maxRetries = 2, delay = 1000, retryOnStatus = [500, 502, 503, 504] } = options;

  return (next) => ({
    async getList(params) {
      let lastError: unknown;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await next.getList(params);
        } catch (err) {
          lastError = err;

          if (attempt < maxRetries && isRetryable(err, retryOnStatus)) {
            const backoff = delay * 2 ** attempt;
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }

          throw err;
        }
      }

      throw lastError;
    },
  });
}
