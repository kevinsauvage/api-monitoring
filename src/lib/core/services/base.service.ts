import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import {
  UnauthorizedError,
  handleError,
  withErrorHandling,
  withSyncErrorHandling,
  logError,
  NotFoundError,
} from "@/lib/shared/errors";
import { container } from "@/lib/infrastructure/di";
import { log } from "@/lib/shared/utils/logger";
import type { ServiceIdentifier } from "@/lib/infrastructure/di";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di";
import type {
  ConnectionRepository,
  HealthCheckRepository,
  CheckResultRepository,
  UserRepository,
  MonitoringRepository,
  CostMetricRepository,
} from "@/lib/core/repositories";

export abstract class BaseService {
  protected resolve<T>(identifier: ServiceIdentifier): T {
    return container.resolve<T>(identifier);
  }

  protected get connectionRepository(): ConnectionRepository {
    return this.resolve<ConnectionRepository>(
      SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY
    );
  }

  protected get healthCheckRepository(): HealthCheckRepository {
    return this.resolve<HealthCheckRepository>(
      SERVICE_IDENTIFIERS.HEALTH_CHECK_REPOSITORY
    );
  }

  protected get checkResultRepository(): CheckResultRepository {
    return this.resolve<CheckResultRepository>(
      SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY
    );
  }

  protected get userRepository(): UserRepository {
    return this.resolve<UserRepository>(SERVICE_IDENTIFIERS.USER_REPOSITORY);
  }

  protected get monitoringRepository(): MonitoringRepository {
    return this.resolve<MonitoringRepository>(
      SERVICE_IDENTIFIERS.MONITORING_REPOSITORY
    );
  }
  protected get costMetricRepository(): CostMetricRepository {
    return this.resolve<CostMetricRepository>(
      SERVICE_IDENTIFIERS.COST_METRIC_REPOSITORY
    );
  }

  protected async getCurrentUser(): Promise<{
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } | null> {
    try {
      const session = await getServerSession(authOptions);
      return session?.user ?? null;
    } catch (error) {
      logError(error as Error, { context: "getCurrentUser" });
      return null;
    }
  }

  protected async requireAuth(): Promise<{
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }> {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) {
        throw new UnauthorizedError("Authentication required");
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      log.error("Authentication error", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new UnauthorizedError("Authentication required");
    }
  }

  protected handleServiceError(error: unknown, context: string): never {
    logError(error as Error, { context });
    throw handleError(error);
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    return withErrorHandling(operation, context);
  }

  protected executeSyncWithErrorHandling<T>(
    operation: () => T,
    context: string
  ): T {
    return withSyncErrorHandling(operation, context);
  }

  /**
   * Validates that a resource exists and belongs to the user
   */
  protected async validateResourceOwnership<T>(
    resourceId: string,
    userId: string,
    repository: {
      findFirstByUserAndId: (id: string, userId: string) => Promise<T | null>;
    },
    resourceName: string
  ): Promise<T> {
    const resource = await repository.findFirstByUserAndId(resourceId, userId);
    if (!resource) {
      throw new NotFoundError(resourceName, resourceId);
    }
    return resource;
  }

  /**
   * Creates a standardized service response
   */
  protected createServiceResponse<T>(
    success: boolean,
    data?: T,
    message?: string,
    error?: string
  ) {
    return {
      success,
      ...(data && { data }),
      ...(message && { message }),
      ...(error && { error }),
    };
  }
}
