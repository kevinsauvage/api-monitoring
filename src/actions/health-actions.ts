"use server";

import { revalidatePath } from "next/cache";
import { getHealthCheckService } from "@/lib/infrastructure/di";
import { healthCheckSchemas } from "@/lib/shared/schemas";
import {
  createDataAction,
  createDeleteAction,
  createUpdateAction,
} from "@/lib/shared/utils/action-factory";
import type { HealthCheckCreateInput } from "@/lib/shared/types";
import type { HealthCheckUpdateInput } from "@/lib/shared/schemas";

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
  async (schemaInput) => {
    const serviceInput: HealthCheckCreateInput = {
      apiConnectionId: schemaInput.apiConnectionId,
      endpoint: schemaInput.endpoint,
      method: schemaInput.method,
      expectedStatus: schemaInput.expectedStatus,
      timeout: schemaInput.timeout,
      interval: schemaInput.interval,
      ...(schemaInput.headers && { headers: schemaInput.headers }),
      ...(schemaInput.body && { body: schemaInput.body }),
      ...(schemaInput.queryParams && { queryParams: schemaInput.queryParams }),
    };

    const result = await healthCheckService.createHealthCheck(serviceInput);

    const { revalidatePath } = await import("next/cache");
    revalidatePath(
      `/dashboard/connections/${schemaInput.apiConnectionId}/health-checks`
    );

    return result;
  },
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);

export const updateHealthCheck = createUpdateAction(
  healthCheckSchemas.update,
  async (input: HealthCheckUpdateInput) =>
    healthCheckService.updateHealthCheck(
      input.healthCheckId,
      input.data as Parameters<typeof healthCheckService.updateHealthCheck>[1]
    ),
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);

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

export const triggerHealthCheck = createDataAction(
  healthCheckSchemas.trigger,
  async (input: { healthCheckId: string }) =>
    healthCheckService.triggerHealthCheck(input.healthCheckId),
  ["/dashboard", "/dashboard/connections", "/dashboard/health"]
);
