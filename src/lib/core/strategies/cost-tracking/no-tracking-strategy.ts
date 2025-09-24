import type { CostTrackingResult } from "@/lib/shared/types/api-results";

import { BaseCostTrackingStrategy, getCurrentPeriod } from "./base-strategy";

export class NoCostTrackingStrategy extends BaseCostTrackingStrategy {
  constructor(private readonly provider: string) {
    super();
  }

  async trackCosts(
    _credentials: Record<string, string>
  ): Promise<CostTrackingResult> {
    const { period } = getCurrentPeriod();

    return Promise.resolve(
      this.createSuccessResult(this.provider, 0, "USD", period, {
        note: `${this.provider} cost tracking not implemented`,
      })
    );
  }
}
