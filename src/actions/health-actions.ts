"use server";

import { revalidatePath } from "next/cache";
import { getHealthCheckService } from "@/lib/infrastructure/di";
import { handleActionError } from "@/lib/shared/errors/error-handler";
import { healthCheckSchemas } from "@/lib/shared/schemas";
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
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      error: result.message,
      zodError: result.zodError,
    };
  }
}

export async function deleteHealthCheck(healthCheckId: string) {
  try {
    const validatedInput = healthCheckSchemas.delete.parse({
      healthCheckId,
    });

    const result = await healthCheckService.deleteHealthCheck(
      validatedInput.healthCheckId
    );

    if (result.success) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/connections");
      revalidatePath("/dashboard/health");
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
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/connections");
      revalidatePath("/dashboard/health");
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
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/connections");
      revalidatePath("/dashboard/health");
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
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/connections");
      revalidatePath("/dashboard/health");
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
