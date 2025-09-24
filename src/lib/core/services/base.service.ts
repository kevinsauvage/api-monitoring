import { getServerSession } from "next-auth";

import type {
  ConnectionRepository,
  HealthCheckRepository,
  CheckResultRepository,
  UserRepository,
  MonitoringRepository,
  CostMetricRepository,
  UserPreferencesRepository,
  NotificationSettingsRepository,
} from "@/lib/core";
import { authOptions } from "@/lib/infrastructure/auth";
import type { ServiceIdentifier } from "@/lib/infrastructure/di";
import { container } from "@/lib/infrastructure/di/container";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di/service-identifiers";
import {
  UnauthorizedError,
  handleError,
  logError,
  NotFoundError,
} from "@/lib/shared/errors";
import { log } from "@/lib/shared/utils";

import type { User } from "next-auth";

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

  protected get userPreferencesRepository(): UserPreferencesRepository {
    return this.resolve<UserPreferencesRepository>(
      SERVICE_IDENTIFIERS.USER_PREFERENCES_REPOSITORY
    );
  }

  protected get notificationSettingsRepository(): NotificationSettingsRepository {
    return this.resolve<NotificationSettingsRepository>(
      SERVICE_IDENTIFIERS.NOTIFICATION_SETTINGS_REPOSITORY
    );
  }

  protected async getCurrentUser(): Promise<User | null> {
    try {
      const session = await getServerSession(authOptions);
      return session?.user ?? null;
    } catch (error) {
      logError(error as Error, { context: "getCurrentUser" });
      return null;
    }
  }

  protected async requireAuth(): Promise<User> {
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
