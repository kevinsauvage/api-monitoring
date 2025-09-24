import type { CheckResultRepository } from "@/lib/core/repositories";
import type { ConnectionService , HealthCheckService , DashboardService , MonitoringService , CronService , CostTrackingService , SettingsService } from "@/lib/core/services";

import { initializeDI } from "./init";

import { container, SERVICE_IDENTIFIERS } from "./index";

initializeDI();

export function getConnectionService(): ConnectionService {
  return container.resolve<ConnectionService>(
    SERVICE_IDENTIFIERS.CONNECTION_SERVICE
  );
}

export function getHealthCheckService(): HealthCheckService {
  return container.resolve<HealthCheckService>(
    SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE
  );
}

export function getDashboardService(): DashboardService {
  return container.resolve<DashboardService>(
    SERVICE_IDENTIFIERS.DASHBOARD_SERVICE
  );
}

export function getMonitoringService(): MonitoringService {
  return container.resolve<MonitoringService>(
    SERVICE_IDENTIFIERS.MONITORING_SERVICE
  );
}

export function getCronService(): CronService {
  return container.resolve<CronService>(SERVICE_IDENTIFIERS.CRON_SERVICE);
}

export function getCheckResultRepository(): CheckResultRepository {
  return container.resolve<CheckResultRepository>(
    SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY
  );
}

export function getCostTrackingService(): CostTrackingService {
  return container.resolve<CostTrackingService>(
    SERVICE_IDENTIFIERS.COST_TRACKING_SERVICE
  );
}

export function getSettingsService(): SettingsService {
  return container.resolve<SettingsService>(
    SERVICE_IDENTIFIERS.SETTINGS_SERVICE
  );
}
