import { container, SERVICE_IDENTIFIERS } from "./index";
import { initializeDI } from "./init";
import type { ConnectionService } from "@/lib/core/services";
import type { HealthCheckService } from "@/lib/core/services";
import type { DashboardService } from "@/lib/core/services";
import type { MonitoringService } from "@/lib/core/services";
import type { CronService } from "@/lib/core/services";
import type { CostTrackingService } from "@/lib/core/services";
import type { SettingsService } from "@/lib/core/services";
import type { CheckResultRepository } from "@/lib/core/repositories";

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
