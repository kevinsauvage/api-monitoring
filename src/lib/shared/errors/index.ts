import { log } from "@/lib/shared/utils/logger";

import { envPrivate } from "../utils/env";

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public override readonly cause?: Error;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    isOperational: boolean = true,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.cause = cause ?? new Error("unknown error");

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string | undefined;

  constructor(message: string, field?: string) {
    super(
      message,
      field ? `VALIDATION_${field.toUpperCase()}` : "VALIDATION_ERROR",
      400
    );
    this.field = field;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, resource?: string) {
    super(
      message,
      resource ? `CONFLICT_${resource.toUpperCase()}` : "CONFLICT",
      409
    );
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, "RATE_LIMIT", 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, "DATABASE_ERROR", 500, true, originalError);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(
      `External service error (${service}): ${message}`,
      "EXTERNAL_SERVICE_ERROR",
      502
    );
  }
}

/**
 * Error handler utility functions
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR", 500);
  }

  return new AppError("An unknown error occurred", "UNKNOWN_ERROR", 500);
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    },
  };
}

/**
 * Error logging utility
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context,
  };

  // In production, you would send this to your error tracking service
  if (envPrivate().NODE_ENV === "production") {
    // Example: Sentry.captureException(error, { extra: context });
    log.error("Production error", errorInfo);
  } else {
    log.error("Development error", errorInfo);
  }
}

/**
 * Safe error message extraction for client display
 */
export function getClientErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.isOperational) {
    return error.message;
  }

  if (error instanceof Error) {
    // In production, don't expose internal error details
    if (envPrivate().NODE_ENV === "production") {
      return "An unexpected error occurred. Please try again.";
    }
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Error boundary helper for Next.js
 */
export function createErrorDigest(error: Error): string {
  // Create a simple hash for error tracking
  const errorString = `${error.name}:${error.message}:${error.stack}`;
  return Buffer.from(errorString).toString("base64").slice(0, 16);
}

/**
 * Async error handler wrapper for services
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error as Error, { context });
    throw handleError(error);
  }
}

/**
 * Sync error handler wrapper for services
 */
export function withSyncErrorHandling<T>(
  operation: () => T,
  context: string
): T {
  try {
    return operation();
  } catch (error) {
    logError(error as Error, { context });
    throw handleError(error);
  }
}
