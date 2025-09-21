import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/infrastructure/database";
import { DatabaseError } from "@/lib/shared/errors";
import { log } from "@/lib/shared/utils/logger";

/**
 * Abstract base repository providing common database operations and error handling
 */
export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Execute a database operation with standardized error handling
   *
   * @param operation - The database operation to execute
   * @param context - Description of the operation for error messages
   * @returns Promise resolving to the operation result
   * @throws {DatabaseError} When the operation fails
   */
  protected async executeQuery<R>(
    operation: () => Promise<R>,
    context: string
  ): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = `Failed to ${context}`;
      log.error(errorMessage, {
        error: error instanceof Error ? error.message : String(error),
        context,
      });
      throw new DatabaseError(errorMessage, error as Error);
    }
  }

  /**
   * Execute multiple operations in parallel with error handling
   *
   * @param operations - Array of database operations to execute
   * @param context - Description of the operations for error messages
   * @returns Promise resolving to array of operation results
   * @throws {DatabaseError} When any operation fails
   */
  protected async executeParallel<R>(
    operations: Array<() => Promise<R>>,
    context: string
  ): Promise<R[]> {
    return this.executeQuery(async () => {
      const results = await Promise.all(operations.map(async (op) => op()));
      return results;
    }, `${context} (parallel)`);
  }

  /**
   * Execute a database operation with retry logic for transient failures
   *
   * @param operation - The database operation to execute
   * @param context - Description of the operation for error messages
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @param retryDelay - Delay between retries in milliseconds (default: 1000)
   * @returns Promise resolving to the operation result
   * @throws {DatabaseError} When the operation fails after all retries
   */
  protected async executeWithRetry<R>(
    operation: () => Promise<R>,
    context: string,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<R> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Only retry on specific database errors (connection issues, timeouts)
        const isRetryableError = this.isRetryableError(error);

        if (!isRetryableError || attempt === maxRetries) {
          break;
        }

        log.warn(`Retrying ${context} (attempt ${attempt}/${maxRetries})`, {
          error: lastError.message,
          context,
          attempt,
        });

        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt)
        );
      }
    }

    const errorMessage = `Failed to ${context} after ${maxRetries} attempts`;
    log.error(errorMessage, {
      error: lastError?.message ?? "Unknown error",
      context,
      maxRetries,
    });
    throw new DatabaseError(
      errorMessage,
      lastError ?? new Error("Unknown error")
    );
  }

  /**
   * Check if an error is retryable (connection issues, timeouts, etc.)
   *
   * @param error - The error to check
   * @returns True if the error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const retryablePatterns = [
      /connection/i,
      /timeout/i,
      /network/i,
      /temporary/i,
      /unavailable/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
    ];

    return retryablePatterns.some((pattern) => pattern.test(error.message));
  }

  /**
   * Build a standardized error message for database operations
   *
   * @param operation - The operation that failed
   * @param entity - The entity being operated on
   * @param identifier - Optional identifier for the entity
   * @returns Formatted error message
   */
  protected buildErrorMessage(
    operation: string,
    entity: string,
    identifier?: string
  ): string {
    const idPart = identifier ? ` with ID '${identifier}'` : "";
    return `Failed to ${operation} ${entity}${idPart}`;
  }

  /**
   * Validate required parameters for database operations
   *
   * @param params - Object containing parameters to validate
   * @param requiredFields - Array of required field names
   * @throws {Error} When required fields are missing or invalid
   */
  protected validateRequiredParams(
    params: Record<string, unknown>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter(
      (field) =>
        params[field] === undefined ||
        params[field] === null ||
        params[field] === ""
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required parameters: ${missingFields.join(", ")}`
      );
    }
  }

  /**
   * Execute a database operation with pagination
   *
   * @param operation - The database operation to execute
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param context - Description of the operation for error messages
   * @returns Promise resolving to paginated result
   */
  protected async executePaginated<T>(
    operation: () => Promise<T[]>,
    page: number,
    limit: number,
    context: string
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    return this.executeQuery(async () => {
      const [data, total] = await Promise.all([
        operation().then((results) => results.slice(skip, skip + limit)),
        operation().then((results) => results.length),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }, `paginated ${context}`);
  }
}
