/**
 * Centralized error handling utilities
 */

import type { ApiResult, ValidationError } from "../types/api-results";

export class ErrorUtils {
  /**
   * Create a standardized error result
   */
  static createErrorResult<T = unknown>(
    error: unknown,
    context?: string
  ): ApiResult<T> {
    const message = error instanceof Error ? error.message : String(error);
    const errorMessage = context ? `${context}: ${message}` : message;

    return {
      success: false,
      error: errorMessage,
    };
  }

  /**
   * Create a validation error result
   */
  static createValidationErrorResult<T = unknown>(
    zodErrors: Array<{ field: string; message: string; code: string }>,
    context?: string
  ): ApiResult<T> & { zodError?: ValidationError[] } {
    const errorMessage = context
      ? `${context}: Validation failed`
      : "Validation failed";

    return {
      success: false,
      error: errorMessage,
      zodError: zodErrors.map((err) => ({
        field: err.field,
        message: err.message,
        code: err.code,
      })),
    };
  }

  /**
   * Create a success result
   */
  static createSuccessResult<T>(
    data: T,
    message = "Operation completed successfully"
  ): ApiResult<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Extract error message from various error types
   */
  static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "Unknown error occurred";
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(
    error: unknown
  ): error is { errors: ValidationError[] } {
    return (
      typeof error === "object" &&
      error !== null &&
      "errors" in error &&
      Array.isArray((error as { errors: unknown }).errors)
    );
  }

  /**
   * Handle async operations with standardized error handling
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<ApiResult<T>> {
    try {
      const result = await operation();
      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(error, context);
    }
  }
}
