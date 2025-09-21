/**
 * Dependency Injection module exports
 */

export { DIContainer, container } from "./container";
export { SERVICE_IDENTIFIERS } from "./service-identifiers";
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
  getCostTrackingService,
} from "./service-factory";
