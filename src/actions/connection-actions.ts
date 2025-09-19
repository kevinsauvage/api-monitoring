"use server";

import { getConnectionService } from "@/lib/infrastructure/di";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { handleActionError } from "@/lib/shared/errors/error-handler";
import { connectionSchemas } from "@/lib/shared/schemas";
import type {
  ConnectionValidationResult,
  ConnectionCreateResult,
  ConnectionActionResult,
  ConnectionValidationInput,
  ConnectionCreateInput,
} from "@/lib/shared/types";

const connectionService = getConnectionService();

export async function validateConnection(
  input: ConnectionValidationInput
): Promise<ConnectionValidationResult> {
  try {
    const connectionService = getConnectionService();
    const validatedInput = connectionSchemas.validation.parse(input);
    return await connectionService.validateConnection(validatedInput);
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      message: result.message,
      data: undefined,
    };
  }
}

export async function createConnection(
  input: ConnectionCreateInput
): Promise<ConnectionCreateResult> {
  try {
    const validatedInput = connectionSchemas.create.parse(input);
    const result = await connectionService.createConnection(validatedInput);

    if (result.success) {
      revalidatePath("/dashboard/connections");
      redirect("/dashboard/connections");
    }

    return result;
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      message: result.message,
    };
  }
}

export async function toggleConnectionActive(
  connectionId: string,
  isActive: boolean
): Promise<ConnectionActionResult> {
  try {
    // Validate input
    const validatedInput = connectionSchemas.toggle.parse({
      connectionId,
      isActive,
    });

    const result = await connectionService.toggleConnectionActive(
      validatedInput.connectionId,
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
      message: result.message,
      error: result.message,
      zodError: result.zodError,
    };
  }
}

export async function deleteConnection(
  connectionId: string
): Promise<ConnectionActionResult> {
  try {
    // Validate input
    const validatedInput = connectionSchemas.delete.parse({
      connectionId,
    });

    const result = await connectionService.deleteConnection(
      validatedInput.connectionId
    );

    if (result.success) {
      revalidatePath("/dashboard/connections");
    }

    return result;
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      message: result.message,
      error: result.message,
      zodError: result.zodError,
    };
  }
}
