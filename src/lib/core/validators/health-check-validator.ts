/**
 * Health check validation logic
 */

import { z } from "zod";
import { healthCheckSchemas } from "@/lib/shared/schemas";
import type { ValidationServiceResult } from "@/lib/shared/types/api-results";
import type { Prisma } from "@prisma/client";

export class HealthCheckValidator {
  /**
   * Validate health check creation data
   */
  static validateCreateData(
    connectionId: string,
    data: Prisma.HealthCheckCreateInput
  ): ValidationServiceResult {
    try {
      healthCheckSchemas.create.parse({
        ...data,
        apiConnectionId: connectionId,
      });

      return {
        success: true,
        message: "Validation successful",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation failed: ${error.errors
            .map((e) => e.message)
            .join(", ")}`,
          zodError: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        };
      }
      if (error instanceof Error) {
        return {
          success: false,
          error: `Validation failed: ${error.message}`,
        };
      }
      return {
        success: false,
        error: "Invalid input data",
      };
    }
  }

  /**
   * Validate health check update data
   */
  static validateUpdateData(
    data: Partial<Prisma.HealthCheckUpdateInput>
  ): ValidationServiceResult {
    try {
      if (data.endpoint !== undefined) {
        healthCheckSchemas.create.shape.endpoint.parse(data.endpoint);
      }
      if (data.method !== undefined) {
        healthCheckSchemas.create.shape.method.parse(data.method);
      }
      if (data.expectedStatus !== undefined) {
        healthCheckSchemas.create.shape.expectedStatus.parse(
          data.expectedStatus
        );
      }
      if (data.timeout !== undefined) {
        healthCheckSchemas.create.shape.timeout.parse(data.timeout);
      }
      if (data.interval !== undefined) {
        healthCheckSchemas.create.shape.interval.parse(data.interval);
      }

      return {
        success: true,
        message: "Validation successful",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation failed: ${error.errors
            .map((e) => e.message)
            .join(", ")}`,
          zodError: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid input data",
      };
    }
  }
}
