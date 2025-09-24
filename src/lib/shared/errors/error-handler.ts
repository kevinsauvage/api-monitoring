import { z } from "zod";

import {
  getClientErrorMessage,
  formatErrorResponse,
  isAppError,
} from "@/lib/shared/errors";
import type { ActionResult } from "@/lib/shared/types";

export function handleActionError(error: unknown): ActionResult {
  if (error instanceof z.ZodError) {
    // Show all validation errors in a user-friendly format
    const errorMessages = error.errors.map((err) => {
      const field = err.path.length > 0 ? `${err.path.join(".")}: ` : "";
      return `${field}${err.message}`;
    });

    return {
      success: false,
      message: `Validation failed: ${errorMessages.join(", ")}`,
      zodError: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })),
    };
  }

  if (isAppError(error)) {
    const errorResponse = formatErrorResponse(error);
    return {
      success: false,
      message: errorResponse.error.message,
    };
  }

  return {
    success: false,
    message: getClientErrorMessage(error),
  };
}
