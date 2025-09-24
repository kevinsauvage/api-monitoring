import type {
  SerializedApiConnection,
  CheckResultWithDetails,
} from "@/lib/core/types";
import {
  serializeEntityTimestamps,
  serializeTimestamp,
} from "@/lib/core/utils/serializer-utils";

import type { ApiConnection } from "@prisma/client";

export interface SerializedConnectionWithHealthChecks
  extends SerializedApiConnection {
  healthChecks: Array<{
    id: string;
    endpoint: string;
    method: string;
    isActive: boolean;
    lastExecutedAt: string | null;
  }>;
}

export interface SerializedConnectionWithHealthChecksAndResults
  extends SerializedConnectionWithHealthChecks {
  recentResults?: CheckResultWithDetails[];
}

export function serializeConnection(
  connection: ApiConnection
): SerializedApiConnection {
  return {
    id: connection.id,
    name: connection.name,
    provider: connection.provider,
    baseUrl: connection.baseUrl,
    isActive: connection.isActive,
    ...serializeEntityTimestamps(connection),
  };
}

export function serializeConnections(
  connections: ApiConnection[]
): SerializedApiConnection[] {
  return connections.map(serializeConnection);
}

export function serializeConnectionWithHealthChecks(
  connection: ApiConnection & {
    healthChecks: Array<{
      id: string;
      endpoint: string;
      method: string;
      isActive: boolean;
      lastExecutedAt: Date | string | null;
    }>;
  }
): SerializedConnectionWithHealthChecks {
  return {
    ...serializeConnection(connection),
    healthChecks: connection.healthChecks.map((healthCheck) => ({
      id: healthCheck.id,
      endpoint: healthCheck.endpoint,
      method: healthCheck.method,
      isActive: healthCheck.isActive,
      lastExecutedAt: serializeTimestamp(healthCheck.lastExecutedAt),
    })),
  };
}

export function serializeConnectionWithHealthChecksAndResults(
  connection: ApiConnection & {
    healthChecks: Array<{
      id: string;
      endpoint: string;
      method: string;
      isActive: boolean;
      lastExecutedAt: Date | string | null;
    }>;
    recentResults?: CheckResultWithDetails[];
  }
): SerializedConnectionWithHealthChecksAndResults {
  return {
    ...serializeConnectionWithHealthChecks(connection),
    recentResults: connection.recentResults ?? [],
  };
}
