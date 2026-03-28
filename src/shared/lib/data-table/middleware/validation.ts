import type { DataProviderMiddleware } from "../provider/data-provider-middleware";

/**
 * Validates each row in the response against a Zod schema.
 * Accepts any object with a `parse(data: unknown): T` method (Zod-compatible).
 */
export function validationMiddleware<TData>(schema: {
  parse: (data: unknown) => TData;
}): DataProviderMiddleware {
  return (next) => ({
    async getList(params) {
      const result = await next.getList(params);
      const validated = result.data.map((item) => schema.parse(item));
      return { ...result, data: validated };
    },
  });
}
