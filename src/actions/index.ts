// Auth actions
export { registerUser } from "./auth-actions";
export type { RegistrationResult } from "./auth-actions";

export {
  validateConnection,
  createConnection,
  toggleConnectionActive,
  deleteConnection,
} from "./connection-actions";

export type {
  ConnectionValidationResult,
  ConnectionCreateResult,
  ConnectionActionResult,
} from "@/lib/types";

export {
  refreshHealthData,
  deleteHealthCheck,
  toggleHealthCheckActive,
  triggerHealthCheck,
  createHealthCheck,
} from "./health-actions";
