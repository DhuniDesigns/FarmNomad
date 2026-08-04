type ApiErrorLike = { data?: { message?: unknown } };

/**
 * RTK Query's `.unwrap()` rejects with `FetchBaseQueryError | SerializedError`
 * for a non-2xx response — our backend's error body always has a `message`
 * string (see AuthResponse.java). Falls back to a generic message for
 * anything else (network failure, unexpected shape).
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as ApiErrorLike | undefined)?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}
