import type {
  CheckResultWithDetails,
  SerializedCheckResult,
} from "@/lib/core/types";
import {
  serializeMetadata,
  serializeTimestamp,
} from "@/lib/core/utils/serializer-utils";

import type { CheckResult } from "@prisma/client";

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
    metadata: serializeMetadata(checkResult.metadata),
    timestamp: serializeTimestamp(checkResult.timestamp) ?? "",
  };
}

export function serializeCheckResults(
  checkResults: CheckResult[]
): SerializedCheckResult[] {
  return checkResults.map(serializeCheckResult);
}

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
