/**
 * Service Registry - Registers all services with the DI container
 */

import { container, SERVICE_IDENTIFIERS } from "./index";
import { UserRepository } from "@/lib/repositories/user.repository";
import { ConnectionRepository } from "@/lib/repositories/connection.repository";
import { HealthCheckRepository } from "@/lib/repositories/health-check.repository";
import { CheckResultRepository } from "@/lib/repositories/check-result.repository";
import { MonitoringRepository } from "@/lib/repositories/monitoring.repository";
import { ConnectionService } from "@/lib/services/connection.service";
import { HealthCheckService } from "@/lib/services/health-check.service";
import { DashboardService } from "@/lib/services/dashboard.service";
import { MonitoringService } from "@/lib/services/monitoring.service";
import { CronService } from "@/lib/services/cron.service";

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
