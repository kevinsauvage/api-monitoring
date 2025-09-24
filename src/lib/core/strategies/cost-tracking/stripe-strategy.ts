/**
 * Stripe cost tracking strategy
 */

import axios from "axios";

import type { CostTrackingResult } from "@/lib/shared/types/api-results";

import { BaseCostTrackingStrategy, getCurrentPeriod } from "./base-strategy";

export class StripeCostTrackingStrategy extends BaseCostTrackingStrategy {
  async trackCosts(
    credentials: Record<string, string>
  ): Promise<CostTrackingResult> {
    try {
      const { start, end, period } = getCurrentPeriod();
      const response = await axios.get<{
        data: Array<{ fee: number }>;
      }>(
        `https://api.stripe.com/v1/balance_transactions?created[gte]=${Math.floor(
          start.getTime() / 1000
        )}&created[lte]=${Math.floor(end.getTime() / 1000)}&limit=100`,
        { headers: { Authorization: `Bearer ${credentials["secretKey"]}` } }
      );

      const transactions = response.data.data;
      const totalFees = transactions.reduce(
        (sum, transaction) => sum + (transaction.fee || 0),
        0
      );

      return this.createSuccessResult(
        "stripe",
        totalFees / 100,
        "USD",
        period,
        { transactionCount: transactions.length, totalFees }
      );
    } catch (error) {
      return this.createErrorResult("stripe", error);
    }
  }
}
