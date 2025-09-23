export function serializeTimestamp(date: Date | string | null): string | null {
  if (!date) return null;

  if (typeof date === "string") return date;

  return date.toISOString();
}

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

export function serializeMetadata(
  metadata: unknown
): Record<string, unknown> | null {
  if (!metadata) return null;

  if (typeof metadata === "object" && metadata !== null) {
    return metadata as Record<string, unknown>;
  }

  return null;
}
