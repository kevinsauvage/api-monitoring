export { DIContainer, container } from "./container";
export type { ServiceFactory, ServiceIdentifier } from "@/lib/shared/types";
export {
  registerAllServices,
  registerRepositories,
  registerServices,
  clearAllServices,
} from "./service-registry";
export { initializeDI, isDIInitialized } from "./init";
export {
  getConnectionService,
  getHealthCheckService,
  getDashboardService,
  getMonitoringService,
  getCronService,
  getCheckResultRepository,
  getSettingsService,
  getBillingService,
  getAlertService,
} from "./service-factory";
export { SERVICE_IDENTIFIERS } from "./service-identifiers";
