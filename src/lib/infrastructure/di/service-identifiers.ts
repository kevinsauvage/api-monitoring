/**
 * Service identifiers for dependency injection
 * Using symbols to prevent naming conflicts
 */

export const SERVICE_IDENTIFIERS = {
  // Repositories
  USER_REPOSITORY: Symbol("UserRepository"),
  CONNECTION_REPOSITORY: Symbol("ConnectionRepository"),
  HEALTH_CHECK_REPOSITORY: Symbol("HealthCheckRepository"),
  CHECK_RESULT_REPOSITORY: Symbol("CheckResultRepository"),
  MONITORING_REPOSITORY: Symbol("MonitoringRepository"),
  COST_METRIC_REPOSITORY: Symbol("CostMetricRepository"),

  // Services
  CONNECTION_SERVICE: Symbol("ConnectionService"),
  HEALTH_CHECK_SERVICE: Symbol("HealthCheckService"),
  DASHBOARD_SERVICE: Symbol("DashboardService"),
  MONITORING_SERVICE: Symbol("MonitoringService"),
  CRON_SERVICE: Symbol("CronService"),
  COST_TRACKING_SERVICE: Symbol("CostTrackingService"),
  SERIALIZATION_SERVICE: Symbol("SerializationService"),
} as const;
