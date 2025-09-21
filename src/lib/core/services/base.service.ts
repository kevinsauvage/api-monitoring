import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import {
  UnauthorizedError,
  handleError,
  withErrorHandling,
  withSyncErrorHandling,
  logError,
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

  protected async getCurrentUser() {
    try {
      const session = await getServerSession(authOptions);
      return session?.user;
    } catch (error) {
      logError(error as Error, { context: "getCurrentUser" });
      return null;
    }
  }

  protected async requireAuth() {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) {
        throw new UnauthorizedError("Authentication required");
      }
      return user;
    } catch (error) {
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
}
