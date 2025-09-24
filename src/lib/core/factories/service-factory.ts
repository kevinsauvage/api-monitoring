/**
 * Modern service factory with better type safety
 */

import { container } from "@/lib/infrastructure/di";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di/service-identifiers";

export class ServiceFactory {
  /**
   * Get a service instance with proper typing
   */
  static get<T>(identifier: string | symbol): T {
    return container.resolve<T>(identifier);
  }

  /**
   * Get connection service
   */
  static getConnectionService() {
    return this.get(SERVICE_IDENTIFIERS.CONNECTION_SERVICE);
  }

  /**
   * Get health check service
   */
  static getHealthCheckService() {
    return this.get(SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE);
  }

  /**
   * Get monitoring service
   */
  static getMonitoringService() {
    return this.get(SERVICE_IDENTIFIERS.MONITORING_SERVICE);
  }

  /**
   * Get dashboard service
   */
  static getDashboardService() {
    return this.get(SERVICE_IDENTIFIERS.DASHBOARD_SERVICE);
  }

  /**
   * Get cost tracking service
   */
  static getCostTrackingService() {
    return this.get(SERVICE_IDENTIFIERS.COST_TRACKING_SERVICE);
  }

  /**
   * Get user service
   */
  static getUserService() {
    return this.get(SERVICE_IDENTIFIERS.USER_SERVICE);
  }

  /**
   * Get cron service
   */
  static getCronService() {
    return this.get(SERVICE_IDENTIFIERS.CRON_SERVICE);
  }

  /**
   * Get cost metric service
   */
  static getCostMetricService() {
    return this.get(SERVICE_IDENTIFIERS.COST_METRIC_SERVICE);
  }
}
