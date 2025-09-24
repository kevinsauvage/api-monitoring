"use server";

import { revalidatePath } from "next/cache";

import { getHealthCheckService } from "@/lib/infrastructure/di";
import { healthCheckSchemas } from "@/lib/shared/schemas";
import {
  createDataAction,
  createDeleteAction,
  createUpdateAction,
} from "@/lib/shared/utils/action-factory";

import type { Prisma } from "@prisma/client";

const healthCheckService = getHealthCheckService();

// eslint-disable-next-line @typescript-eslint/require-await
export async function refreshHealthData() {
  try {
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

export const createHealthCheck = createDataAction(
  healthCheckSchemas.create,
  async (input) => {
    const serviceInput: Prisma.HealthCheckCreateInput = {
      apiConnection: {
        connect: { id: input.apiConnectionId },
      },
      endpoint: input.endpoint,
      method: input.method,
      expectedStatus: input.expectedStatus,
      timeout: input.timeout,
      interval: input.interval,
      ...(input.headers && { headers: input.headers }),
      ...(input.body && { body: input.body }),
      ...(input.queryParams && { queryParams: input.queryParams }),
    };

    const result = await healthCheckService.createHealthCheck(
      input.apiConnectionId,
      serviceInput
    );

    const { revalidatePath } = await import("next/cache");
    revalidatePath(
      `/dashboard/connections/${input.apiConnectionId}/health-checks`
    );

    return result;
  },
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);

export const updateHealthCheck = createUpdateAction(
  healthCheckSchemas.update,
  async (input) =>
    healthCheckService.updateHealthCheck(input.healthCheckId, input.data),
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);

export const deleteHealthCheck = createDeleteAction(
  healthCheckSchemas.delete,
  async (input) => {
    const result = await healthCheckService.deleteHealthCheck(
      input.healthCheckId
    );
    if (!result.success) {
      throw new Error(result.error ?? "Operation failed");
    }
  },
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);

export const triggerHealthCheck = createDataAction(
  healthCheckSchemas.trigger,
  async (input) => healthCheckService.triggerHealthCheck(input.healthCheckId),
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);
