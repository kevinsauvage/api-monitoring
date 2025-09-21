/**
 * Date serialization utilities
 * Provides consistent date handling across the application
 */

/**
 * Serialize a date to ISO string format
 * Handles both Date objects and string dates
 */
export function serializeDate(
  date: Date | string | null | undefined
): string | null {
  if (!date) return null;

  if (date instanceof Date) {
    return date.toISOString();
  }

  if (typeof date === "string") {
    return date;
  }

  return null;
}

/**
 * Serialize multiple dates to ISO string format
 */
export function serializeDates<T extends Record<string, unknown>>(
  obj: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of dateFields) {
    if (field in result) {
      result[field] = serializeDate(
        result[field] as string | Date | null | undefined
      ) as T[keyof T];
    }
  }

  return result;
}

/**
 * Common date fields for serialization
 */
export const COMMON_DATE_FIELDS = [
  "createdAt",
  "updatedAt",
  "lastExecutedAt",
  "timestamp",
] as const;
