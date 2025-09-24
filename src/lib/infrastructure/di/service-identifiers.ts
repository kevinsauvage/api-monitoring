export const SERVICE_IDENTIFIERS = {
  // Repositories
  USER_REPOSITORY: Symbol("UserRepository"),
  CONNECTION_REPOSITORY: Symbol("ConnectionRepository"),
  HEALTH_CHECK_REPOSITORY: Symbol("HealthCheckRepository"),
  CHECK_RESULT_REPOSITORY: Symbol("CheckResultRepository"),
  MONITORING_REPOSITORY: Symbol("MonitoringRepository"),
  COST_METRIC_REPOSITORY: Symbol("CostMetricRepository"),
  USER_PREFERENCES_REPOSITORY: Symbol("UserPreferencesRepository"),
  NOTIFICATION_SETTINGS_REPOSITORY: Symbol("NotificationSettingsRepository"),
  BILLING_REPOSITORY: Symbol("BillingRepository"),

  // Services
  CONNECTION_SERVICE: Symbol("ConnectionService"),
  HEALTH_CHECK_SERVICE: Symbol("HealthCheckService"),
  DASHBOARD_SERVICE: Symbol("DashboardService"),
  MONITORING_SERVICE: Symbol("MonitoringService"),
  CRON_SERVICE: Symbol("CronService"),
  COST_TRACKING_SERVICE: Symbol("CostTrackingService"),
  COST_METRIC_SERVICE: Symbol("CostMetricService"),
  SERIALIZATION_SERVICE: Symbol("SerializationService"),
  USER_SERVICE: Symbol("UserService"),
  SETTINGS_SERVICE: Symbol("SettingsService"),
  BILLING_SERVICE: Symbol("BillingService"),
} as const;
