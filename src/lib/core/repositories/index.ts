// Base repository
export { BaseRepository } from "./base.repository";

// Entity repositories
export { UserRepository } from "./user.repository";
export { ConnectionRepository } from "./connection.repository";
export { HealthCheckRepository } from "./health-check.repository";
export { CheckResultRepository } from "./check-result.repository";
export { MonitoringRepository } from "./monitoring.repository";
export { CostMetricRepository } from "./cost-metric.repository";

// Export types (now using Prisma-generated types)
export type { ConnectionWithHealthChecks } from "./connection.repository";
export type { CheckResultWithDetails } from "./check-result.repository";

// Re-export Prisma types for convenience
export type {
  User,
  ApiConnection,
  HealthCheck,
  CheckResult,
  CostMetric,
  Subscription,
} from "@prisma/client";
