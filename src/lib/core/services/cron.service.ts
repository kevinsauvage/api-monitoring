import { BaseService } from "./base.service";
import { NotFoundError } from "@/lib/shared/errors";
import { healthCheckExecutor } from "@/lib/core/monitoring/health-check-executor";
import { decrypt } from "@/lib/infrastructure/encryption";

export class CronService extends BaseService {
  async getHealthChecksDueForExecution(): Promise<
    Array<{
      id: string;
      apiConnectionId: string;
      endpoint: string;
      method: string;
      expectedStatus: number;
      timeout: number;
      interval: number;
      lastExecutedAt: Date | null;
      apiConnection: {
        id: string;
        isActive: boolean;
      };
    }>
  > {
    const now = new Date();

    return this.healthCheckRepository.findDueForExecution(now);
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
