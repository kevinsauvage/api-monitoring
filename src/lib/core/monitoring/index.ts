// Core monitoring components
import { HealthCheckExecutor } from "./health-check-executor";

// Create a singleton instance for backward compatibility
export const healthCheckExecutor = new HealthCheckExecutor();

// Types (only exported for internal use between monitoring modules)
export type {
  HealthCheckResult,
  HealthCheckConfig,
  ConnectionWithCredentials,
} from "@/lib/shared/types";
