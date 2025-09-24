"use server";

import { getCostTrackingService } from "@/lib/infrastructure/di";
import { costSchemas } from "@/lib/shared/schemas";
import { createAuthenticatedAction } from "@/lib/shared/utils/action-factory";

const costTrackingService = getCostTrackingService();

export const getCostAnalytics = createAuthenticatedAction(
  costSchemas.analytics,
  async (input, userId: string) =>
    costTrackingService.getCostAnalytics(userId, input.startDate, input.endDate)
);

export const getCostMetrics = createAuthenticatedAction(
  costSchemas.metrics,
  async (input, userId: string) => {
    const metrics = await costTrackingService.getCostMetricsForUser(
      userId,
      input.startDate,
      input.endDate
    );

    // Transform the data to convert Decimal to number
    return (
      metrics?.map((metric) => ({
        ...metric,
        amount: Number(metric.amount),
      })) ?? []
    );
  }
);

export const trackAllCosts = createAuthenticatedAction(
  costSchemas.analytics,
  async (_input, userId: string) => {
    await costTrackingService.trackAllUserCosts(userId);
    return { success: true, message: "Cost tracking completed successfully" };
  },
  ["/dashboard/cost"]
);

export const trackConnectionCosts = createAuthenticatedAction(
  costSchemas.trackConnection,
  async (input, _userId: string) => {
    const result = await costTrackingService.trackCostsForConnection(
      input.connectionId
    );

    return {
      success: result.success,
      message: result.success
        ? "Cost tracking completed"
        : result.error ?? "Failed to track costs",
      costData: result.costData,
    };
  },
  ["/dashboard/cost"]
);
