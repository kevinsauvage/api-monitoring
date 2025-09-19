import type { ApiConnection } from "@prisma/client";

/**
 * Serialized connection data for API responses
 */
export interface SerializedConnection {
  id: string;
  name: string;
  provider: string;
  baseUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Serialized connection with health checks
 */
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

/**
 * Serialize an ApiConnection model for API responses
 */
export function serializeConnection(
  connection: ApiConnection
): SerializedConnection {
  return {
    id: connection.id,
    name: connection.name,
    provider: connection.provider,
    baseUrl: connection.baseUrl,
    isActive: connection.isActive,
    createdAt: connection.createdAt.toISOString(),
    updatedAt: connection.updatedAt.toISOString(),
  };
}

/**
 * Serialize multiple ApiConnection models
 */
export function serializeConnections(
  connections: ApiConnection[]
): SerializedConnection[] {
  return connections.map(serializeConnection);
}

/**
 * Serialize connection with health checks
 */
export function serializeConnectionWithHealthChecks(
  connection: ApiConnection & {
    healthChecks: Array<{
      id: string;
      endpoint: string;
      method: string;
      isActive: boolean;
      lastExecutedAt: Date | null;
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
      lastExecutedAt: healthCheck.lastExecutedAt?.toISOString() ?? null,
    })),
  };
}
