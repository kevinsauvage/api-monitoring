/**
 * Serialize a date to ISO string
 */
export function serializeTimestamp(date: Date | string | null): string | null {
  if (!date) return null;

  if (typeof date === "string") return date;

  return date.toISOString();
}

/**
 * Serialize entity timestamps
 */
export function serializeEntityTimestamps(entity: {
  createdAt: Date | string;
  updatedAt: Date | string;
  lastExecutedAt?: Date | string | null;
}) {
  return {
    createdAt:
      serializeTimestamp(entity.createdAt) ?? entity.createdAt.toString(),
    updatedAt:
      serializeTimestamp(entity.updatedAt) ?? entity.updatedAt.toString(),
    ...(entity.lastExecutedAt && {
      lastExecutedAt: serializeTimestamp(entity.lastExecutedAt),
    }),
  };
}

/**
 * Serialize JSON metadata safely
 */
export function serializeMetadata(
  metadata: unknown
): Record<string, unknown> | null {
  if (!metadata) return null;

  if (typeof metadata === "object" && metadata !== null) {
    return metadata as Record<string, unknown>;
  }

  return null;
}

/**
 * Serialize headers safely
 */
export function serializeHeaders(
  headers: unknown
): Record<string, string> | null {
  if (!headers) return null;

  if (typeof headers === "object" && headers !== null) {
    return headers as Record<string, string>;
  }

  return null;
}

/**
 * Serialize query params safely
 */
export function serializeQueryParams(
  queryParams: unknown
): Record<string, string> | null {
  if (!queryParams) return null;

  if (typeof queryParams === "object" && queryParams !== null) {
    return queryParams as Record<string, string>;
  }

  return null;
}

/**
 * Create a safe serializer that handles null/undefined values
 */
export function createSafeSerializer<T, R>(
  serializer: (item: T) => R
): (item: T | null | undefined) => R | null {
  return (item: T | null | undefined) => {
    if (!item) return null;
    return serializer(item);
  };
}

/**
 * Serialize an array of items safely
 */
export function serializeArray<T, R>(
  items: T[] | null | undefined,
  serializer: (item: T) => R
): R[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(serializer);
}
