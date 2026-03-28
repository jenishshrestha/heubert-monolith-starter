/**
 * Resolve a value from a nested object using dot-notation path.
 * e.g. getByPath({ a: { b: 1 } }, "a.b") → 1
 */
export function getByPath(obj: unknown, path: string): unknown {
  let current = obj;
  for (const key of path.split(".")) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Resolve headers that can be either a static object or a function returning one.
 */
export function resolveHeaders(
  headers: Record<string, string> | (() => Record<string, string>) | undefined,
): Record<string, string> {
  if (!headers) {
    return {};
  }
  return typeof headers === "function" ? headers() : headers;
}
