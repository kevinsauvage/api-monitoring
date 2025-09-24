import { UserRepository , ConnectionRepository , HealthCheckRepository , CheckResultRepository , MonitoringRepository , CostMetricRepository , UserPreferencesRepository , NotificationSettingsRepository } from "@/lib/core/repositories";
import { ConnectionService , HealthCheckService , DashboardService , MonitoringService , CronService , CostTrackingService , CostMetricService , SettingsService } from "@/lib/core/services";

import { container, SERVICE_IDENTIFIERS } from "./index";

/**
 * Register all repositories as singletons
 */
export function registerRepositories(): void {
  container.registerSingleton(
    SERVICE_IDENTIFIERS.USER_REPOSITORY,
    () => new UserRepository()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY,
    () => new ConnectionRepository()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.HEALTH_CHECK_REPOSITORY,
    () => new HealthCheckRepository()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY,
    () => new CheckResultRepository()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.MONITORING_REPOSITORY,
    () => new MonitoringRepository()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.COST_METRIC_REPOSITORY,
    () => new CostMetricRepository()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.USER_PREFERENCES_REPOSITORY,
    () => new UserPreferencesRepository()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.NOTIFICATION_SETTINGS_REPOSITORY,
    () => new NotificationSettingsRepository()
  );
}

/**
 * Register all services as singletons
 */
export function registerServices(): void {
  container.registerSingleton(
    SERVICE_IDENTIFIERS.CONNECTION_SERVICE,
    () => new ConnectionService()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE,
    () => new HealthCheckService()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.DASHBOARD_SERVICE,
    () => new DashboardService()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.MONITORING_SERVICE,
    () => new MonitoringService()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.CRON_SERVICE,
    () => new CronService()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.COST_TRACKING_SERVICE,
    () => new CostTrackingService()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.COST_METRIC_SERVICE,
    () => new CostMetricService()
  );

  container.registerSingleton(
    SERVICE_IDENTIFIERS.SETTINGS_SERVICE,
    () => new SettingsService()
  );
}

/**
 * Register all services and repositories
 */
export function registerAllServices(): void {
  registerRepositories();
  registerServices();
}

/**
 * Clear all services (useful for testing)
 */
export function clearAllServices(): void {
  container.clear();
}
