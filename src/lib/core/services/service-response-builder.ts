/**
 * Service response builder for consistent API responses
 */

import type {
  ApiResult,
  CreateApiResult,
  ValidationServiceResult,
} from "@/lib/shared/types/api-results";
import { ErrorUtils } from "@/lib/shared/utils/error-utils";

export class ServiceResponseBuilder {
  /**
   * Create a success response
   */
  static success<T>(
    data: T,
    message = "Operation completed successfully"
  ): ApiResult<T> {
    return ErrorUtils.createSuccessResult(data, message);
  }

  /**
   * Create a success response for creation operations
   */
  static created(
    id: string,
    message = "Resource created successfully"
  ): CreateApiResult {
    return {
      success: true,
      id,
      message,
    };
  }

  /**
   * Create an error response
   */
  static error<T = unknown>(error: unknown, context?: string): ApiResult<T> {
    return ErrorUtils.createErrorResult(error, context);
  }

  /**
   * Create a validation error response
   */
  static validationError<T = unknown>(
    zodErrors: Array<{ field: string; message: string; code: string }>,
    context?: string
  ): ValidationServiceResult<T> {
    return ErrorUtils.createValidationErrorResult(zodErrors, context);
  }

  /**
   * Create a not found response
   */
  static notFound(resource = "Resource"): ApiResult {
    return {
      success: false,
      error: `${resource} not found`,
    };
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(message = "Unauthorized access"): ApiResult {
    return {
      success: false,
      error: message,
    };
  }

  /**
   * Create a forbidden response
   */
  static forbidden(message = "Access forbidden"): ApiResult {
    return {
      success: false,
      error: message,
    };
  }

  /**
   * Create a rate limit response
   */
  static rateLimited(message = "Rate limit exceeded"): ApiResult {
    return {
      success: false,
      error: message,
    };
  }

  /**
   * Create a service unavailable response
   */
  static serviceUnavailable(
    message = "Service temporarily unavailable"
  ): ApiResult {
    return {
      success: false,
      error: message,
    };
  }
}
