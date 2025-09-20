import type { CheckResult, CheckStatus } from "@prisma/client";
import type { CheckResultWithDetails } from "../repositories";

/**
 * Serialized check result data for API responses
 */
export interface SerializedCheckResult {
  id: string;
  healthCheckId: string;
  status: CheckStatus;
  responseTime: number;
  statusCode: number | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

/**
 * Serialized check result with health check details
 */
export interface SerializedCheckResultWithDetails
  extends SerializedCheckResult {
  healthCheck: {
    id: string;
    endpoint: string;
    method: string;
    apiConnection: {
      name: string;
      provider: string;
    };
  };
}

/**
 * Serialize a CheckResult model for API responses
 */
export function serializeCheckResult(
  checkResult: CheckResult
): SerializedCheckResult {
  return {
    id: checkResult.id,
    healthCheckId: checkResult.healthCheckId,
    status: checkResult.status,
    responseTime: checkResult.responseTime,
    statusCode: checkResult.statusCode,
    errorMessage: checkResult.errorMessage,
    metadata: checkResult.metadata as Record<string, unknown> | null,
    timestamp:
      checkResult.timestamp instanceof Date
        ? checkResult.timestamp.toISOString()
        : checkResult.timestamp,
  };
}

/**
 * Serialize multiple CheckResult models
 */
export function serializeCheckResults(
  checkResults: CheckResult[]
): SerializedCheckResult[] {
  return checkResults.map(serializeCheckResult);
}

/**
 * Serialize check result with health check details
 */
export function serializeCheckResultWithDetails(
  checkResult: CheckResultWithDetails
): SerializedCheckResultWithDetails {
  return {
    ...serializeCheckResult(checkResult),
    healthCheck: {
      id: checkResult.healthCheck.id,
      endpoint: checkResult.healthCheck.endpoint,
      method: checkResult.healthCheck.method,
      apiConnection: {
        name: checkResult.healthCheck.apiConnection.name,
        provider: checkResult.healthCheck.apiConnection.provider,
      },
    },
  };
}

/**
 * Serialize multiple check results with details
 */
export function serializeCheckResultsWithDetails(
  checkResults: Array<
    CheckResult & {
      healthCheck: {
        id: string;
        endpoint: string;
        method: string;
        apiConnection: {
          name: string;
          provider: string;
        };
      };
    }
  >
): SerializedCheckResultWithDetails[] {
  return checkResults.map(serializeCheckResultWithDetails);
}
