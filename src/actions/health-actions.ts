"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHealthCheckService } from "@/lib/infrastructure/di";
import { handleActionError } from "@/lib/shared/errors/error-handler";
import { healthCheckSchemas } from "@/lib/shared/schemas";
import type { HealthCheckCreateInput } from "@/lib/shared/types";

// eslint-disable-next-line @typescript-eslint/require-await
export async function refreshHealthData() {
  try {
    revalidatePath("/dashboard/health");

    return { success: true };
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}

export async function refreshHealthDataAndRedirect() {
  await refreshHealthData();
  redirect("/dashboard/health");
}

const healthCheckService = getHealthCheckService();

export async function deleteHealthCheck(healthCheckId: string) {
  try {
    const validatedInput = healthCheckSchemas.delete.parse({
      healthCheckId,
    });

    const result = await healthCheckService.deleteHealthCheck(
      validatedInput.healthCheckId
    );

    if (result.success) {
      revalidatePath("/dashboard/connections");
    }

    return result;
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}

export async function toggleHealthCheckActive(
  healthCheckId: string,
  isActive: boolean
) {
  try {
    // Validate input
    const validatedInput = healthCheckSchemas.toggle.parse({
      healthCheckId,
      isActive,
    });

    const result = await healthCheckService.toggleHealthCheckActive(
      validatedInput.healthCheckId,
      validatedInput.isActive
    );

    if (result.success) {
      revalidatePath("/dashboard/connections");
    }

    return result;
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}

export async function triggerHealthCheck(healthCheckId: string) {
  try {
    // Validate input
    const validatedInput = healthCheckSchemas.trigger.parse({
      healthCheckId,
    });

    const result = await healthCheckService.triggerHealthCheck(
      validatedInput.healthCheckId
    );

    if (result.success) {
      revalidatePath("/dashboard/connections");
    }

    return result;
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}

export async function createHealthCheck(input: HealthCheckCreateInput) {
  try {
    const result = await healthCheckService.createHealthCheck(input);

    if (result.success) {
      revalidatePath(
        `/dashboard/connections/${input.apiConnectionId}/health-checks`
      );
    }

    return result;
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}
