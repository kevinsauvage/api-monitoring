"use server";

import { getConnectionService } from "@/lib/infrastructure/di";
import { connectionSchemas } from "@/lib/shared/schemas";
import {
  createDataAction,
  createDeleteAction,
} from "@/lib/shared/utils/action-factory";
import type {
  ConnectionValidationInput,
  ConnectionCreateInput,
} from "@/lib/shared/types";

const connectionService = getConnectionService();

export const validateConnection = createDataAction(
  connectionSchemas.validation,
  async (input: ConnectionValidationInput) =>
    connectionService.validateConnection(input),
  undefined
);

export const createConnection = createDataAction(
  connectionSchemas.create,
  async (input: ConnectionCreateInput) =>
    connectionService.createConnection(input),
  ["/dashboard", "/dashboard/connections"]
);

export async function updateConnection(input: {
  connectionId: string;
  data: Record<string, unknown>;
}) {
  try {
    const result = await connectionService.updateConnection(
      input.connectionId,
      input.data
    );

    if (result.success) {
      // Revalidate paths
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/connections");
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

export const deleteConnection = createDeleteAction(
  connectionSchemas.delete,
  async (input: { connectionId: string }) => {
    const result = await connectionService.deleteConnection(input.connectionId);
    if (!result.success) {
      throw new Error(result.message);
    }
  },
  ["/dashboard", "/dashboard/connections"]
);
