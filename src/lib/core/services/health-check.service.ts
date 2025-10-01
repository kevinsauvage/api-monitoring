import type { HealthCheckWithResults } from "@/lib/core/types";
import { HealthCheckValidator } from "@/lib/core/validators/health-check-validator";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di";
import type { ValidationServiceResult } from "@/lib/shared/types/api-results";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";

import { BaseService } from "./base.service";
import { ServiceResponseBuilder } from "./service-response-builder";

import type { MonitoringService } from "./monitoring.service";
import type { HealthCheck, Prisma } from "@prisma/client";

export class HealthCheckService extends BaseService {
  private get monitoringService(): MonitoringService {
    return this.resolve<MonitoringService>(
      SERVICE_IDENTIFIERS.MONITORING_SERVICE
    );
  }

  async getHealthChecksForConnection(
    connectionId: string
  ): Promise<{ healthChecks: HealthCheck[] }> {
    const user = await this.requireAuth();

    const connection = await this.connectionRepository.findFirstByUserAndId(
      connectionId,
      user.id
    );

    if (!connection) {
      return {
        healthChecks: [],
      };
    }

    const healthChecks = await this.healthCheckRepository.findByConnectionId(
      connectionId
    );

    return {
      healthChecks,
    };
  }

  async getHealthChecksWithResultsForConnection(
    connectionId: string,
    resultsLimit = 10
  ): Promise<{
    healthChecks: HealthCheckWithResults[];
  }> {
    const user = await this.requireAuth();

    const connection = await this.connectionRepository.findFirstByUserAndId(
      connectionId,
      user.id
    );

    if (!connection) {
      return {
        healthChecks: [],
      };
    }

    const healthChecks = await this.healthCheckRepository.findByConnectionId(
      connectionId
    );

    const healthChecksWithResults = await Promise.all(
      healthChecks.map(async (healthCheck) => {
        const recentResults =
          await this.checkResultRepository.findByHealthCheckId(
            healthCheck.id,
            resultsLimit
          );

        return {
          ...healthCheck,
          recentResults,
        };
      })
    );

    return {
      healthChecks: healthChecksWithResults,
    };
  }

  async getConnectionHistory(connectionId: string, limit = 100) {
    const user = await this.requireAuth();

    const connection = await this.connectionRepository.findFirstByUserAndId(
      connectionId,
      user.id
    );

    if (!connection) {
      return [];
    }

    return this.checkResultRepository.findByConnectionId(connectionId, limit);
  }

  async createHealthCheck(
    connectionId: string,
    data: Prisma.HealthCheckCreateInput
  ): Promise<ValidationServiceResult> {
    const user = await this.requireAuth();

    const userData = await this.userRepository.findByIdWithSubscription(
      user.id
    );

    if (!userData) {
      return ServiceResponseBuilder.error("User not found");
    }

    const planLimits = getPlanLimits(userData.subscription);
    const currentHealthChecks = await this.healthCheckRepository.countByUserId(
      user.id
    );

    if (currentHealthChecks >= planLimits.maxHealthChecks) {
      return ServiceResponseBuilder.error(
        `Health check limit reached. You can create up to ${planLimits.maxHealthChecks} health checks on the ${planLimits.name} plan.`
      );
    }

    // Validate the data
    const validationResult = HealthCheckValidator.validateCreateData(
      connectionId,
      data
    );
    if (!validationResult.success) {
      return validationResult;
    }

    const healthCheck = await this.healthCheckRepository.create({
      apiConnection: {
        connect: { id: connectionId },
      },
      endpoint: data.endpoint,
      method: data.method ?? "GET",
      expectedStatus: data.expectedStatus ?? 200,
      timeout: data.timeout ?? 30,
      interval: data.interval ?? 300,
      headers: data.headers ?? {},
      body: data.body ?? null,
      queryParams: data.queryParams ?? {},
      isActive: true,
      lastExecutedAt: null,
    });

    return ServiceResponseBuilder.success(
      healthCheck,
      "Health check created successfully"
    );
  }

  async deleteHealthCheck(healthCheckId: string) {
    const user = await this.requireAuth();

    await this.validateResourceOwnership(
      healthCheckId,
      user.id,
      this.healthCheckRepository,
      "Health check"
    );

    await this.healthCheckRepository.delete(healthCheckId);

    return this.createServiceResponse(
      true,
      undefined,
      "Health check deleted successfully"
    );
  }

  async updateHealthCheck(
    healthCheckId: string,
    data: Partial<Prisma.HealthCheckUpdateInput>
  ) {
    const user = await this.requireAuth();

    await this.validateResourceOwnership(
      healthCheckId,
      user.id,
      this.healthCheckRepository,
      "Health check"
    );

    await this.healthCheckRepository.update(healthCheckId, data);

    return this.createServiceResponse(
      true,
      undefined,
      "Health check updated successfully"
    );
  }

  async triggerHealthCheck(healthCheckId: string) {
    const user = await this.requireAuth();

    await this.validateResourceOwnership(
      healthCheckId,
      user.id,
      this.healthCheckRepository,
      "Health check"
    );

    // Ensure monitoring service is resolved correctly in DI-driven tests
    const monitoring = this.monitoringService;
    await monitoring.triggerHealthCheck(healthCheckId);

    await this.healthCheckRepository.update(healthCheckId, {
      lastExecutedAt: new Date(),
    });

    return this.createServiceResponse(
      true,
      undefined,
      "Health check triggered successfully"
    );
  }
}
