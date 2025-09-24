import { prisma } from "@/lib/infrastructure/database";
import { DatabaseError } from "@/lib/shared/errors";
import { log } from "@/lib/shared/utils/logger";

import type { PrismaClient } from "@prisma/client";

export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

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

  protected async executeParallel<R>(
    operations: Array<() => Promise<R>>,
    context: string
  ): Promise<R[]> {
    return this.executeQuery(async () => {
      const results = await Promise.all(operations.map(async (op) => op()));
      return results;
    }, `${context} (parallel)`);
  }

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

  protected buildErrorMessage(
    operation: string,
    entity: string,
    identifier?: string
  ): string {
    const idPart = identifier ? ` with ID '${identifier}'` : "";
    return `Failed to ${operation} ${entity}${idPart}`;
  }

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
