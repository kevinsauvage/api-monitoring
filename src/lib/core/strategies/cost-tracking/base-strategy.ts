/**
 * Base cost tracking strategy interface and utilities
 */

import type { CostTrackingResult } from "@/lib/shared/types/api-results";

export interface CostTrackingStrategy {
  trackCosts(credentials: Record<string, string>): Promise<CostTrackingResult>;
}

export interface CostTrackingCredentials {
  apiKey?: string;
  secretKey?: string;
  accountSid?: string;
  authToken?: string;
  token?: string;
}

export function getCurrentPeriod() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`,
  };
}

export abstract class BaseCostTrackingStrategy implements CostTrackingStrategy {
  abstract trackCosts(
    credentials: Record<string, string>
  ): Promise<CostTrackingResult>;

  protected createSuccessResult(
    provider: string,
    amount: number,
    currency: string,
    period: string,
    metadata?: unknown
  ): CostTrackingResult {
    return {
      success: true,
      costData: {
        provider,
        amount,
        currency,
        period,
        metadata,
      },
    };
  }

  protected createErrorResult(
    provider: string,
    error: unknown
  ): CostTrackingResult {
    return {
      success: false,
      error: `${provider} cost tracking failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
