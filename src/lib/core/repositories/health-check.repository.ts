import type { HealthCheck, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class HealthCheckRepository extends BaseRepository {
  /**
   * Find all health checks for a connection
   *
   * @param connectionId - The connection's unique identifier
   * @returns Promise resolving to array of health checks
   */
  async findByConnectionId(connectionId: string): Promise<HealthCheck[]> {
    this.validateRequiredParams({ connectionId }, ["connectionId"]);

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
    this.validateRequiredParams({ id, data }, ["id", "data"]);

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
    this.validateRequiredParams({ userId }, ["userId"]);

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
    this.validateRequiredParams({ userId }, ["userId"]);

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
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

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
    this.validateRequiredParams(data, ["endpoint", "method", "apiConnection"]);

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
    this.validateRequiredParams({ id }, ["id"]);

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
    this.validateRequiredParams({ id }, ["id"]);

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
    this.validateRequiredParams({ currentTime }, ["currentTime"]);

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
      this.buildErrorMessage("find", "health checks due for execution")
    );
  }

  /**
   * Find all health checks for a user with pagination
   *
   * @param userId - The user's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated health checks
   */
  async findByUserIdPaginated(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: HealthCheck[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    this.validateRequiredParams({ userId, page, limit }, ["userId"]);

    return this.executePaginated(
      async () =>
        this.prisma.healthCheck.findMany({
          where: {
            apiConnection: {
              userId,
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      page,
      limit,
      this.buildErrorMessage("find", "health checks for user", userId)
    );
  }

  /**
   * Find active health checks for a user
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to array of active health checks
   */
  async findActiveByUserId(userId: string): Promise<HealthCheck[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findMany({
          where: {
            apiConnection: {
              userId,
            },
            isActive: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      this.buildErrorMessage("find", "active health checks for user", userId)
    );
  }

  /**
   * Update health check status (active/inactive)
   *
   * @param id - The health check's unique identifier
   * @param isActive - Whether the health check should be active
   * @returns Promise resolving to the updated health check
   */
  async updateStatus(id: string, isActive: boolean): Promise<HealthCheck> {
    this.validateRequiredParams({ id, isActive }, ["id", "isActive"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.update({
          where: { id },
          data: { isActive },
        }),
      this.buildErrorMessage("update", "health check status", id)
    );
  }

  /**
   * Update last executed timestamp for a health check
   *
   * @param id - The health check's unique identifier
   * @param lastExecutedAt - The timestamp of last execution
   * @returns Promise resolving to the updated health check
   */
  async updateLastExecuted(
    id: string,
    lastExecutedAt: Date
  ): Promise<HealthCheck> {
    this.validateRequiredParams({ id, lastExecutedAt }, [
      "id",
      "lastExecutedAt",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.update({
          where: { id },
          data: { lastExecutedAt },
        }),
      this.buildErrorMessage("update", "health check last executed", id)
    );
  }
}
