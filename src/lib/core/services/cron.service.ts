import { healthCheckExecutor } from "@/lib/core/monitoring/health-check-executor";
import type { HealthCheckWithConnectionAndSubscription } from "@/lib/core/types";
import { decrypt } from "@/lib/infrastructure/encryption";
import { NotFoundError } from "@/lib/shared/errors";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";

import { BaseService } from "./base.service";

export class CronService extends BaseService {
  async getHealthChecksDueForExecution(): Promise<
    HealthCheckWithConnectionAndSubscription[]
  > {
    const now = new Date();

    const healthChecks = await this.healthCheckRepository.findDueForExecution(
      now
    );

    return healthChecks.filter((healthCheck) => {
      if (!healthCheck.apiConnection.isActive) {
        return false;
      }

      const planLimits = getPlanLimits(
        healthCheck.apiConnection.user.subscription
      );
      const requiredIntervalSeconds = Math.max(
        healthCheck.interval,
        planLimits.minInterval
      );

      if (!healthCheck.lastExecutedAt) {
        return true;
      }

      const elapsedMilliseconds =
        now.getTime() - healthCheck.lastExecutedAt.getTime();

      return elapsedMilliseconds >= requiredIntervalSeconds * 1000;
    });
  }

  async executeHealthCheck(healthCheck: {
    id: string;
    apiConnectionId: string;
    endpoint: string;
    method: string;
    expectedStatus: number;
    timeout: number;
  }): Promise<void> {
    const connection = await this.connectionRepository.findByIdWithCredentials(
      healthCheck.apiConnectionId
    );

    if (!connection) {
      throw new NotFoundError("Connection", healthCheck.apiConnectionId);
    }

    const connectionWithCredentials = {
      ...connection,
      apiKey: connection.apiKey ? decrypt(connection.apiKey) : null,
      secretKey: connection.secretKey ? decrypt(connection.secretKey) : null,
    };

    const config = {
      id: healthCheck.id,
      apiConnectionId: healthCheck.apiConnectionId,
      endpoint: healthCheck.endpoint,
      method: healthCheck.method,
      expectedStatus: healthCheck.expectedStatus,
      timeout: healthCheck.timeout,
    };

    const result = await healthCheckExecutor.executeHealthCheck(
      config,
      connectionWithCredentials
    );

    // Store result using monitoring repository
    await this.monitoringRepository.storeResult({
      healthCheckId: result.healthCheckId,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage,
      metadata: result.metadata as Record<string, unknown>,
    });

    // Update last executed timestamp
    await this.healthCheckRepository.update(healthCheck.id, {
      lastExecutedAt: new Date(),
    });
  }
}
