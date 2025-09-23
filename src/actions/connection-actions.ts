"use server";

import { getConnectionService } from "@/lib/infrastructure/di";
import { connectionSchemas } from "@/lib/shared/schemas";
import {
  createDataAction,
  createDeleteAction,
  createUpdateAction,
} from "@/lib/shared/utils/action-factory";

const connectionService = getConnectionService();

export const validateConnection = createDataAction(
  connectionSchemas.validation,
  async (input) => connectionService.validateConnection(input)
);

export const createConnection = createDataAction(
  connectionSchemas.create,
  async (input) => connectionService.createConnection(input),
  ["/dashboard", "/dashboard/connections"]
);

export const updateConnection = createUpdateAction(
  connectionSchemas.update,
  async (input) =>
    connectionService.updateConnection(input.connectionId, input.data),
  ["/dashboard", "/dashboard/connections"]
);

export const deleteConnection = createDeleteAction(
  connectionSchemas.delete,
  async (input) => {
    const result = await connectionService.deleteConnection(input.connectionId);
    if (!result.success) {
      throw new Error(result.message);
    }
  },
  ["/dashboard", "/dashboard/connections"]
);
