/**
 * Service Registry - Registers all services with the DI container
 */

import { container, SERVICE_IDENTIFIERS } from "./index";
import { UserRepository } from "@/lib/core/repositories/user.repository";
import { ConnectionRepository } from "@/lib/core/repositories/connection.repository";
import { HealthCheckRepository } from "@/lib/core/repositories/health-check.repository";
import { CheckResultRepository } from "@/lib/core/repositories/check-result.repository";
import { MonitoringRepository } from "@/lib/core/repositories/monitoring.repository";
import { ConnectionService } from "@/lib/core/services/connection.service";
import { HealthCheckService } from "@/lib/core/services/health-check.service";
import { DashboardService } from "@/lib/core/services/dashboard.service";
import { MonitoringService } from "@/lib/core/services/monitoring.service";
import { CronService } from "@/lib/core/services/cron.service";

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
