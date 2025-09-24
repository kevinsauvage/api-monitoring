/**
 * Twilio cost tracking strategy
 */

import axios from "axios";
import { BaseCostTrackingStrategy, getCurrentPeriod } from "./base-strategy";
import type { CostTrackingResult } from "@/lib/shared/types/api-results";

export class TwilioCostTrackingStrategy extends BaseCostTrackingStrategy {
  async trackCosts(
    credentials: Record<string, string>
  ): Promise<CostTrackingResult> {
    try {
      const { start, end, period } = getCurrentPeriod();
      const response = await axios.get<{
        usage_records: Array<{ price?: string }>;
      }>(
        `https://api.twilio.com/2010-04-01/Accounts/${
          credentials["accountSid"]
        }/Usage/Records.json?StartDate=${
          start.toISOString().split("T")[0]
        }&EndDate=${end.toISOString().split("T")[0]}`,
        {
          auth: {
            username: credentials["accountSid"],
            password: credentials["authToken"],
          },
        }
      );

      const usage = response.data.usage_records;
      const totalCost = usage.reduce(
        (sum, record) => sum + parseFloat(record.price ?? "0"),
        0
      );

      return this.createSuccessResult("twilio", totalCost, "USD", period, {
        usageCount: usage.length,
      });
    } catch (error) {
      return this.createErrorResult("twilio", error);
    }
  }
}
