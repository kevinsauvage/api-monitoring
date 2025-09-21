import type { ApiConnection } from "@prisma/client";
import type { CheckResultWithDetails } from "@/lib/core/repositories";
import {
  serializeEntityTimestamps,
  serializeTimestamp,
} from "@/lib/core/utils/serializer-utils";
import type { SerializedApiConnection } from "@/lib/core/types";

export type SerializedConnection = SerializedApiConnection;

export interface SerializedConnectionWithHealthChecks
  extends SerializedConnection {
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
): SerializedConnection {
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
): SerializedConnection[] {
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
