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
 * Serialized health check with stats
 */
export interface SerializedHealthCheckWithStats extends SerializedHealthCheck {
  stats?: {
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    recentFailures: number;
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
    lastExecutedAt: healthCheck.lastExecutedAt
      ? healthCheck.lastExecutedAt instanceof Date
        ? healthCheck.lastExecutedAt.toISOString()
        : healthCheck.lastExecutedAt
      : null,
    createdAt:
      healthCheck.createdAt instanceof Date
        ? healthCheck.createdAt.toISOString()
        : healthCheck.createdAt,
    updatedAt:
      healthCheck.updatedAt instanceof Date
        ? healthCheck.updatedAt.toISOString()
        : healthCheck.updatedAt,
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

/**
 * Serialize a HealthCheck with stats for API responses
 */
export function serializeHealthCheckWithStats(
  healthCheck: HealthCheck & {
    stats?: {
      totalChecks: number;
      successRate: number;
      averageResponseTime: number;
      recentFailures: number;
    };
  }
): SerializedHealthCheckWithStats {
  const result = serializeHealthCheck(healthCheck);

  if (healthCheck.stats) {
    return {
      ...result,
      stats: healthCheck.stats,
    };
  }

  return result;
}
