export interface DataProviderError {
  message: string;
  statusCode?: number;
  code?: string;
  errors?: Array<{ field?: string; message: string }>;
  raw?: unknown;
}

export function isDataProviderError(err: unknown): err is DataProviderError {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as DataProviderError).message === "string"
  );
}

export function normalizeError(err: unknown): DataProviderError {
  if (isDataProviderError(err)) {
    return err;
  }

  if (err instanceof Response) {
    return {
      message: `HTTP ${err.status}: ${err.statusText}`,
      statusCode: err.status,
      raw: err,
    };
  }

  if (err instanceof Error) {
    return { message: err.message, raw: err };
  }

  return { message: "Unknown error", raw: err };
}
