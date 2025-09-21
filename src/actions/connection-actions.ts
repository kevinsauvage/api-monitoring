"use server";

import { getConnectionService } from "@/lib/infrastructure/di";
import { connectionSchemas } from "@/lib/shared/schemas";
import {
  createDataAction,
  createDeleteAction,
  createUpdateAction,
} from "@/lib/shared/utils/action-factory";
import type {
  ConnectionValidationInput,
  ConnectionCreateInput,
} from "@/lib/shared/types";
import type { ConnectionUpdateInput } from "@/lib/shared/schemas";

const connectionService = getConnectionService();

export const validateConnection = createDataAction(
  connectionSchemas.validation,
  async (input: ConnectionValidationInput) =>
    connectionService.validateConnection(input)
);

export const createConnection = createDataAction(
  connectionSchemas.create,
  async (input: ConnectionCreateInput) =>
    connectionService.createConnection(input),
  ["/dashboard", "/dashboard/connections"]
);

export const updateConnection = createUpdateAction(
  connectionSchemas.update,
  async (input: ConnectionUpdateInput) =>
    connectionService.updateConnection(
      input.connectionId,
      input.data as Parameters<typeof connectionService.updateConnection>[1]
    ),
  ["/dashboard", "/dashboard/connections"]
);

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
