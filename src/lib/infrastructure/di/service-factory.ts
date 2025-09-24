import type { CheckResultRepository } from "@/lib/core/repositories";
import type {
  ConnectionService,
  HealthCheckService,
  DashboardService,
  MonitoringService,
  CronService,
  SettingsService,
  BillingService,
} from "@/lib/core/services";

import { container } from "./container";
import { initializeDI } from "./init";
import { SERVICE_IDENTIFIERS } from "./service-identifiers";

// Lazy initialization - only initialize when first service is requested
let isInitialized = false;

function ensureInitialized(): void {
  if (!isInitialized) {
    initializeDI();
    isInitialized = true;
  }
}

export function getConnectionService(): ConnectionService {
  ensureInitialized();
  return container.resolve<ConnectionService>(
    SERVICE_IDENTIFIERS.CONNECTION_SERVICE
  );
}

export function getHealthCheckService(): HealthCheckService {
  ensureInitialized();
  return container.resolve<HealthCheckService>(
    SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE
  );
}

export function getDashboardService(): DashboardService {
  ensureInitialized();
  return container.resolve<DashboardService>(
    SERVICE_IDENTIFIERS.DASHBOARD_SERVICE
  );
}

export function getMonitoringService(): MonitoringService {
  ensureInitialized();
  return container.resolve<MonitoringService>(
    SERVICE_IDENTIFIERS.MONITORING_SERVICE
  );
}

export function getCronService(): CronService {
  ensureInitialized();
  return container.resolve<CronService>(SERVICE_IDENTIFIERS.CRON_SERVICE);
}

export function getCheckResultRepository(): CheckResultRepository {
  ensureInitialized();
  return container.resolve<CheckResultRepository>(
    SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY
  );
}

export function getSettingsService(): SettingsService {
  ensureInitialized();
  return container.resolve<SettingsService>(
    SERVICE_IDENTIFIERS.SETTINGS_SERVICE
  );
}

export function getBillingService(): BillingService {
  ensureInitialized();
  return container.resolve<BillingService>(SERVICE_IDENTIFIERS.BILLING_SERVICE);
}
