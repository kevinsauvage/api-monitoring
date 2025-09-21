"use server";

import { revalidatePath } from "next/cache";
import { getHealthCheckService } from "@/lib/infrastructure/di";
import { healthCheckSchemas } from "@/lib/shared/schemas";
import {
  createDataAction,
  createDeleteAction,
} from "@/lib/shared/utils/action-factory";
import type { HealthCheckCreateInput } from "@/lib/shared/types";

const healthCheckService = getHealthCheckService();

// eslint-disable-next-line @typescript-eslint/require-await
export async function refreshHealthData() {
  try {
    // Revalidate all dashboard pages
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/health");
    revalidatePath("/dashboard/health/failures");
    revalidatePath("/dashboard/health/performance");

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to refresh health data",
    };
  }
}

export const deleteHealthCheck = createDeleteAction(
  healthCheckSchemas.delete,
  async (input: { healthCheckId: string }) => {
    const result = await healthCheckService.deleteHealthCheck(
      input.healthCheckId
    );
    if (!result.success) {
      throw new Error(result.error ?? "Operation failed");
    }
  },
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);

export async function updateHealthCheck(input: {
  healthCheckId: string;
  data: Record<string, unknown>;
}) {
  try {
    const result = await healthCheckService.updateHealthCheck(
      input.healthCheckId,
      input.data
    );

    if (result.success) {
      // Revalidate paths
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/connections");
      revalidatePath("/dashboard/health");
    }

    return result;
  } catch (error) {
    const { handleActionError } = await import(
      "@/lib/shared/errors/error-handler"
    );
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}

export const triggerHealthCheck = createDataAction(
  healthCheckSchemas.trigger,
  async (input: { healthCheckId: string }) =>
    healthCheckService.triggerHealthCheck(input.healthCheckId),
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);

export async function createHealthCheck(input: HealthCheckCreateInput) {
  try {
    const result = await healthCheckService.createHealthCheck(input);

    if (result.success) {
      // Revalidate paths
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/connections");
      revalidatePath("/dashboard/health");
      revalidatePath(
        `/dashboard/connections/${input.apiConnectionId}/health-checks`
      );
    }

    return result;
  } catch (error) {
    const { handleActionError } = await import(
      "@/lib/shared/errors/error-handler"
    );
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}
