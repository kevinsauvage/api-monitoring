import { container, SERVICE_IDENTIFIERS } from "./index";
import { initializeDI } from "./init";
import type { ConnectionService } from "@/lib/core/services/connection.service";
import type { HealthCheckService } from "@/lib/core/services/health-check.service";
import type { DashboardService } from "@/lib/core/services/dashboard.service";
import type { MonitoringService } from "@/lib/core/services/monitoring.service";
import type { CronService } from "@/lib/core/services/cron.service";
import type { CheckResultRepository } from "@/lib/core/repositories/check-result.repository";

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
