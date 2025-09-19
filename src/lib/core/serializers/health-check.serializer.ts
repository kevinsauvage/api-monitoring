import type { HealthCheck } from "@prisma/client";

/**
 * Serialized health check data for API responses
 */
export interface SerializedHealthCheck {
  id: string;
  apiConnectionId: string;
  endpoint: string;
  method: string;
  expectedStatus: number;
  timeout: number;
  interval: number;
  headers: Record<string, string> | null;
  body: string | null;
  queryParams: Record<string, string> | null;
  isActive: boolean;
  lastExecutedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Serialized health check with connection info
 */
export interface SerializedHealthCheckWithConnection
  extends SerializedHealthCheck {
  connection: {
    id: string;
    name: string;
    provider: string;
  };
}

/**
 * Serialize a HealthCheck model for API responses
 */
export function serializeHealthCheck(
  healthCheck: HealthCheck
): SerializedHealthCheck {
  return {
    id: healthCheck.id,
    apiConnectionId: healthCheck.apiConnectionId,
    endpoint: healthCheck.endpoint,
    method: healthCheck.method,
    expectedStatus: healthCheck.expectedStatus,
    timeout: healthCheck.timeout,
    interval: healthCheck.interval,
    headers: healthCheck.headers as Record<string, string> | null,
    body: healthCheck.body,
    queryParams: healthCheck.queryParams as Record<string, string> | null,
    isActive: healthCheck.isActive,
    lastExecutedAt: healthCheck.lastExecutedAt?.toISOString() ?? null,
    createdAt: healthCheck.createdAt.toISOString(),
    updatedAt: healthCheck.updatedAt.toISOString(),
  };
}

/**
 * Serialize multiple HealthCheck models
 */
export function serializeHealthChecks(
  healthChecks: HealthCheck[]
): SerializedHealthCheck[] {
  return healthChecks.map(serializeHealthCheck);
}

/**
 * Serialize health check with connection info
 */
export function serializeHealthCheckWithConnection(
  healthCheck: HealthCheck & {
    apiConnection: {
      id: string;
      name: string;
      provider: string;
    };
  }
): SerializedHealthCheckWithConnection {
  return {
    ...serializeHealthCheck(healthCheck),
    connection: {
      id: healthCheck.apiConnection.id,
      name: healthCheck.apiConnection.name,
      provider: healthCheck.apiConnection.provider,
    },
  };
}
