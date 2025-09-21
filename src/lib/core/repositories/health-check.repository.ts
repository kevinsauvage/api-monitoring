import type { HealthCheck, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

/**
 * Repository for managing Health Check entities
 * Provides data access methods for health check operations with standardized error handling
 */
export class HealthCheckRepository extends BaseRepository {
  /**
   * Find all health checks for a connection
   *
   * @param connectionId - The connection's unique identifier
   * @returns Promise resolving to array of health checks
   */
  async findByConnectionId(connectionId: string): Promise<HealthCheck[]> {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findMany({
          where: { apiConnectionId: connectionId },
          orderBy: { createdAt: "desc" },
        }),
      this.buildErrorMessage(
        "find",
        "health checks for connection",
        connectionId
      )
    );
  }

  /**
   * Update a health check by ID
   *
   * @param id - The health check's unique identifier
   * @param data - Data to update
   * @returns Promise resolving to the updated health check
   */
  async update(
    id: string,
    data: Prisma.HealthCheckUpdateInput
  ): Promise<HealthCheck> {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "health check", id)
    );
  }

  /**
   * Count health checks for a user
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to health check count
   */
  async countByUserId(userId: string): Promise<number> {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.count({
          where: {
            apiConnection: {
              userId,
            },
          },
        }),
      this.buildErrorMessage("count", "health checks for user", userId)
    );
  }

  /**
   * Count active health checks for a user
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to active health check count
   */
  async countActiveByUserId(userId: string): Promise<number> {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.count({
          where: {
            apiConnection: {
              userId,
            },
            isActive: true,
          },
        }),
      this.buildErrorMessage("count", "active health checks for user", userId)
    );
  }

  /**
   * Find a health check by ID and user ID (ownership verification)
   *
   * @param id - The health check's unique identifier
   * @param userId - The user's unique identifier
   * @returns Promise resolving to health check or null if not found
   */
  async findFirstByUserAndId(
    id: string,
    userId: string
  ): Promise<HealthCheck | null> {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findFirst({
          where: {
            id,
            apiConnection: {
              userId,
            },
          },
        }),
      this.buildErrorMessage("find", "health check", `${id} for user ${userId}`)
    );
  }

  /**
   * Create a new health check
   *
   * @param data - Health check creation data
   * @returns Promise resolving to the created health check
   */
  async create(data: Prisma.HealthCheckCreateInput): Promise<HealthCheck> {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.create({
          data,
        }),
      this.buildErrorMessage("create", "health check")
    );
  }

  /**
   * Find a health check by ID
   *
   * @param id - The health check's unique identifier
   * @returns Promise resolving to health check or null if not found
   */
  async findById(id: string): Promise<HealthCheck | null> {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findUnique({
          where: { id },
        }),
      this.buildErrorMessage("find", "health check", id)
    );
  }

  /**
   * Delete a health check by ID
   *
   * @param id - The health check's unique identifier
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    await this.executeQuery(
      async () =>
        this.prisma.healthCheck.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "health check", id)
    );
  }

  /**
   * Find health checks that are due for execution
   *
   * @param currentTime - Current timestamp for comparison
   * @returns Promise resolving to array of health checks due for execution
   */
  async findDueForExecution(currentTime: Date): Promise<
    Array<{
      id: string;
      apiConnectionId: string;
      endpoint: string;
      method: string;
      expectedStatus: number;
      timeout: number;
      interval: number;
      lastExecutedAt: Date | null;
      apiConnection: {
        id: string;
        isActive: boolean;
      };
    }>
  > {
    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findMany({
          where: {
            isActive: true,
            OR: [
              { lastExecutedAt: null },
              {
                lastExecutedAt: {
                  lte: new Date(currentTime.getTime() - 300000), // 5 minutes ago
                },
              },
            ],
          },
          select: {
            id: true,
            apiConnectionId: true,
            endpoint: true,
            method: true,
            expectedStatus: true,
            timeout: true,
            interval: true,
            lastExecutedAt: true,
            apiConnection: {
              select: {
                id: true,
                isActive: true,
              },
            },
          },
          orderBy: { lastExecutedAt: "asc" },
        }),
      "find health checks due for execution"
    );
  }
}
