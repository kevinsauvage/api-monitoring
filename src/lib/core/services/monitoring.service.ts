import { BaseService } from "./base.service";
import { NotFoundError } from "@/lib/shared/errors";
import { healthCheckExecutor } from "@/lib/core/monitoring/health-check-executor";
import { decrypt } from "@/lib/infrastructure/encryption";
import type { HealthCheck } from "@prisma/client";
import type {
  HealthCheckCreateInput,
  HealthCheckUpdateInput,
} from "@/lib/shared/types";
import { serializeHealthCheck } from "@/lib/core/serializers";

export class MonitoringService extends BaseService {
  async createHealthCheck(input: HealthCheckCreateInput): Promise<HealthCheck> {
    await this.requireAuth();

    return this.healthCheckRepository.create({
      apiConnection: {
        connect: { id: input.apiConnectionId },
      },
      endpoint: input.endpoint,
      method: input.method ?? "GET",
      expectedStatus: input.expectedStatus ?? 200,
      timeout: input.timeout ?? 30,
      interval: input.interval ?? 300,
      headers: input.headers ?? {},
      body: input.body ?? null,
      queryParams: input.queryParams ?? {},
      isActive: true,
      lastExecutedAt: input.lastExecutedAt ?? null,
    });
  }

  async updateHealthCheck(
    id: string,
    input: HealthCheckUpdateInput
  ): Promise<HealthCheck> {
    await this.requireAuth();

    return this.healthCheckRepository.update(id, input);
  }

  async deleteHealthCheck(id: string): Promise<void> {
    await this.requireAuth();

    await this.healthCheckRepository.delete(id);
  }

  async getHealthChecksForConnection(connectionId: string) {
    await this.requireAuth();

    const healthChecks =
      await this.monitoringRepository.getHealthChecksWithStats(connectionId);

    return healthChecks.map(serializeHealthCheck);
  }

  async triggerHealthCheck(healthCheckId: string): Promise<void> {
    await this.requireAuth();

    const healthCheck = await this.healthCheckRepository.findById(
      healthCheckId
    );
    if (!healthCheck) {
      throw new NotFoundError("Health check", healthCheckId);
    }

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

    const result = await healthCheckExecutor.executeHealthCheck(
      {
        id: healthCheck.id,
        apiConnectionId: healthCheck.apiConnectionId,
        endpoint: healthCheck.endpoint,
        method: healthCheck.method,
        expectedStatus: healthCheck.expectedStatus,
        timeout: healthCheck.timeout,
        headers: healthCheck.headers as Record<string, string>,
        body: healthCheck.body ?? "",
        queryParams: healthCheck.queryParams as Record<string, string>,
      },
      connectionWithCredentials
    );

    await this.monitoringRepository.storeResult({
      healthCheckId: result.healthCheckId,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage,
      metadata: result.metadata,
    });

    await this.healthCheckRepository.update(healthCheckId, {
      lastExecutedAt: new Date(),
    });
  }
}
