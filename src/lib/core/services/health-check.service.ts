import { BaseService } from "./base.service";
import type {
  HealthCheckRepository,
  CheckResultRepository,
  UserRepository,
  ConnectionRepository,
} from "@/lib/core/repositories";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";
import type { HealthCheckCreateInput } from "@/lib/shared/types";
import { healthCheckSchemas } from "@/lib/shared/schemas";
import { z } from "zod";
import type { MonitoringService } from "./monitoring.service";
import type { HealthCheck } from "@prisma/client";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di";

export type HealthCheckData = {
  healthChecks: Array<
    Omit<HealthCheck, "createdAt" | "updatedAt" | "lastExecutedAt"> & {
      createdAt: string;
      updatedAt: string;
      lastExecutedAt: string | null;
    }
  >;
};

export type HealthCheckWithResults = Omit<
  HealthCheck,
  "createdAt" | "updatedAt" | "lastExecutedAt"
> & {
  createdAt: string;
  updatedAt: string;
  lastExecutedAt: string | null;
  recentResults: Array<{
    id: string;
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    timestamp: string;
  }>;
};

export type HealthCheckDataWithResults = {
  healthChecks: HealthCheckWithResults[];
};

export interface HealthCheckCreateResult {
  success: boolean;
  message?: string;
  error?: string;
  healthCheck?: HealthCheck;
  zodError?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export class HealthCheckService extends BaseService {
  private get healthCheckRepository(): HealthCheckRepository {
    return this.resolve<HealthCheckRepository>(
      SERVICE_IDENTIFIERS.HEALTH_CHECK_REPOSITORY
    );
  }

  private get checkResultRepository(): CheckResultRepository {
    return this.resolve<CheckResultRepository>(
      SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY
    );
  }

  private get userRepository(): UserRepository {
    return this.resolve<UserRepository>(SERVICE_IDENTIFIERS.USER_REPOSITORY);
  }

  private get connectionRepository(): ConnectionRepository {
    return this.resolve<ConnectionRepository>(
      SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY
    );
  }

  private get monitoringService(): MonitoringService {
    return this.resolve<MonitoringService>(
      SERVICE_IDENTIFIERS.MONITORING_SERVICE
    );
  }

  async getHealthChecksForConnection(
    connectionId: string
  ): Promise<HealthCheckData> {
    const user = await this.requireAuth();

    const connection = await this.connectionRepository.findByIdAndUserId(
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

    const serializedHealthChecks = healthChecks.map((healthCheck) => ({
      ...healthCheck,
      createdAt: healthCheck.createdAt.toISOString(),
      updatedAt: healthCheck.updatedAt.toISOString(),
      lastExecutedAt: healthCheck.lastExecutedAt?.toISOString() ?? null,
    }));

    return {
      healthChecks: serializedHealthChecks,
    };
  }

  async getHealthChecksWithResultsForConnection(
    connectionId: string,
    resultsLimit = 10
  ): Promise<HealthCheckDataWithResults> {
    const user = await this.requireAuth();

    const connection = await this.connectionRepository.findByIdAndUserId(
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

    // Get recent results for each health check
    const healthChecksWithResults = await Promise.all(
      healthChecks.map(async (healthCheck) => {
        const recentResults =
          await this.checkResultRepository.findByHealthCheckId(
            healthCheck.id,
            resultsLimit
          );

        const serializedResults = recentResults.map((result) => ({
          id: result.id,
          status: result.status,
          responseTime: result.responseTime,
          timestamp: result.timestamp.toISOString(),
        }));

        return {
          ...healthCheck,
          createdAt: healthCheck.createdAt.toISOString(),
          updatedAt: healthCheck.updatedAt.toISOString(),
          lastExecutedAt: healthCheck.lastExecutedAt?.toISOString() ?? null,
          recentResults: serializedResults,
        };
      })
    );

    return {
      healthChecks: healthChecksWithResults,
    };
  }

  async getConnectionHistory(connectionId: string, limit = 100) {
    const user = await this.requireAuth();

    const connection = await this.connectionRepository.findByIdAndUserId(
      connectionId,
      user.id
    );

    if (!connection) {
      return [];
    }

    return this.checkResultRepository.findByConnectionId(connectionId, limit);
  }

  async createHealthCheck(
    input: HealthCheckCreateInput
  ): Promise<HealthCheckCreateResult> {
    const user = await this.requireAuth();

    const userData = await this.userRepository.findByIdWithSubscription(
      user.id
    );

    if (!userData) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const planLimits = getPlanLimits(userData.subscription);
    const currentHealthChecks = await this.healthCheckRepository.countByUserId(
      user.id
    );

    if (currentHealthChecks >= planLimits.maxHealthChecks) {
      return {
        success: false,
        error: `Health check limit reached. You can create up to ${planLimits.maxHealthChecks} health checks on the ${planLimits.name} plan.`,
      };
    }

    // Validate input using Zod schema
    try {
      healthCheckSchemas.create.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation failed: ${error.errors
            .map((e) => e.message)
            .join(", ")}`,
          zodError: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        };
      }
      if (error instanceof Error) {
        return {
          success: false,
          error: `Validation failed: ${error.message}`,
        };
      }
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    const healthCheck = await this.healthCheckRepository.create({
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
      lastExecutedAt: null,
    });

    return {
      success: true,
      healthCheck,
    };
  }

  async deleteHealthCheck(healthCheckId: string) {
    const user = await this.requireAuth();

    const healthCheck = await this.healthCheckRepository.findFirstByUserAndId(
      healthCheckId,
      user.id
    );

    if (!healthCheck) {
      return {
        success: false,
        error: "Health check not found or unauthorized",
      };
    }

    await this.healthCheckRepository.delete(healthCheckId);

    return {
      success: true,
    };
  }

  async toggleHealthCheckActive(healthCheckId: string, isActive: boolean) {
    const user = await this.requireAuth();

    const healthCheck = await this.healthCheckRepository.findFirstByUserAndId(
      healthCheckId,
      user.id
    );

    if (!healthCheck) {
      return {
        success: false,
        error: "Health check not found or unauthorized",
      };
    }

    await this.healthCheckRepository.update(healthCheckId, {
      isActive: !isActive,
    });

    return {
      success: true,
    };
  }

  async triggerHealthCheck(healthCheckId: string) {
    const user = await this.requireAuth();

    const healthCheck = await this.healthCheckRepository.findFirstByUserAndId(
      healthCheckId,
      user.id
    );

    if (!healthCheck) {
      return {
        success: false,
        error: "Health check not found or unauthorized",
      };
    }

    await this.monitoringService.triggerHealthCheck(healthCheckId);

    await this.healthCheckRepository.update(healthCheckId, {
      lastExecutedAt: new Date(),
    });

    return {
      success: true,
    };
  }
}
