import { BaseService } from "./base.service";
import { NotFoundError } from "@/lib/errors";
import { healthCheckExecutor } from "@/lib/monitoring/health-check-executor";
import { decrypt } from "@/lib/encryption";
import type { HealthCheckRepository } from "@/lib/repositories/health-check.repository";
import type { ConnectionRepository } from "@/lib/repositories/connection.repository";
import type { MonitoringRepository } from "@/lib/repositories/monitoring.repository";
import { SERVICE_IDENTIFIERS } from "@/lib/di";

export class CronService extends BaseService {
  private get healthCheckRepository(): HealthCheckRepository {
    return this.resolve<HealthCheckRepository>(
      SERVICE_IDENTIFIERS.HEALTH_CHECK_REPOSITORY
    );
  }

  private get connectionRepository(): ConnectionRepository {
    return this.resolve<ConnectionRepository>(
      SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY
    );
  }

  private get monitoringRepository(): MonitoringRepository {
    return this.resolve<MonitoringRepository>(
      SERVICE_IDENTIFIERS.MONITORING_REPOSITORY
    );
  }

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

    return this.healthCheckRepository.prisma.healthCheck.findMany({
      where: {
        isActive: true,
        OR: [
          { lastExecutedAt: null }, // Never executed
          {
            lastExecutedAt: {
              lte: new Date(now.getTime() - 30_000), // At least 30 seconds ago
            },
          },
        ],
      },
      select: {
        id: true,
        apiConnectionId: true,
        endpoint: true,
        method: true,
        expectedStatus: true,
        timeout: true,
        interval: true,
        lastExecutedAt: true,
        apiConnection: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
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
    // Get connection with decrypted credentials
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
      metadata: result.metadata,
    });

    // Update last executed timestamp
    await this.healthCheckRepository.prisma.healthCheck.update({
      where: { id: healthCheck.id },
      data: { lastExecutedAt: new Date() },
    });
  }
}
