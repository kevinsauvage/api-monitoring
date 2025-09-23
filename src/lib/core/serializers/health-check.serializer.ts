import { serializeEntityTimestamps } from "@/lib/core/utils/serializer-utils";
import type { HealthCheck } from "@prisma/client";
import type { SerializedHealthCheck } from "@/lib/core/types";

export interface SerializedHealthCheckWithConnection
  extends SerializedHealthCheck {
  connection: {
    id: string;
    name: string;
    provider: string;
  };
}

export interface SerializedHealthCheckWithStats extends SerializedHealthCheck {
  stats?: {
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    recentFailures: number;
  };
}

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
    ...serializeEntityTimestamps(healthCheck),
  };
}

export function serializeHealthChecks(
  healthChecks: HealthCheck[]
): SerializedHealthCheck[] {
  return healthChecks.map(serializeHealthCheck);
}

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
