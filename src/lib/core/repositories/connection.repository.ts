import type { ApiConnection, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type ConnectionWithHealthChecks = Prisma.ApiConnectionGetPayload<{
  include: {
    healthChecks: {
      select: {
        id: true;
        endpoint: true;
        method: true;
        isActive: true;
        lastExecutedAt: true;
      };
    };
  };
}>;

export class ConnectionRepository extends BaseRepository {
  /**
   * Find all connections for a user with their health checks
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to array of connections with health checks
   */
  async findByUserIdWithHealthChecks(
    userId: string
  ): Promise<ConnectionWithHealthChecks[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findMany({
          where: { userId },
          include: {
            healthChecks: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                isActive: true,
                lastExecutedAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      this.buildErrorMessage("find", "connections for user", userId)
    );
  }

  /**
   * Find a connection by ID and user ID with health checks
   *
   * @param id - The connection's unique identifier
   * @param userId - The user's unique identifier
   * @returns Promise resolving to connection with health checks or null if not found
   */
  async findByIdWithHealthChecks(
    id: string,
    userId: string
  ): Promise<ConnectionWithHealthChecks | null> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findFirst({
          where: {
            id,
            userId,
          },
          include: {
            healthChecks: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                isActive: true,
                lastExecutedAt: true,
              },
            },
          },
        }),
      this.buildErrorMessage(
        "find",
        "connection with health checks",
        `${id} for user ${userId}`
      )
    );
  }

  /**
   * Create a new API connection
   *
   * @param data - Connection creation data
   * @returns Promise resolving to the created connection
   */
  async create(data: Prisma.ApiConnectionCreateInput): Promise<ApiConnection> {
    this.validateRequiredParams(data, [
      "name",
      "provider",
      "baseUrl",
      "userId",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.create({
          data,
        }),
      this.buildErrorMessage("create", "connection")
    );
  }

  /**
   * Update multiple connections matching the criteria
   *
   * @param where - Criteria to match connections
   * @param data - Data to update
   * @returns Promise resolving to update count
   */
  async updateMany(
    where: Prisma.ApiConnectionWhereInput,
    data: Prisma.ApiConnectionUpdateInput
  ): Promise<{ count: number }> {
    this.validateRequiredParams({ where, data }, ["where", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.updateMany({
          where,
          data,
        }),
      this.buildErrorMessage("update", "multiple connections")
    );
  }

  /**
   * Delete multiple connections matching the criteria
   *
   * @param where - Criteria to match connections
   * @returns Promise resolving to deletion count
   */
  async deleteMany(
    where: Prisma.ApiConnectionWhereInput
  ): Promise<{ count: number }> {
    this.validateRequiredParams({ where }, ["where"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.deleteMany({
          where,
        }),
      this.buildErrorMessage("delete", "multiple connections")
    );
  }

  /**
   * Count connections for a user
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to connection count
   */
  async countByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.count({
          where: { userId },
        }),
      this.buildErrorMessage("count", "connections for user", userId)
    );
  }

  /**
   * Count active connections for a user
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to active connection count
   */
  async countActiveByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.count({
          where: {
            userId,
            isActive: true,
          },
        }),
      this.buildErrorMessage("count", "active connections for user", userId)
    );
  }

  /**
   * Find a connection by ID and user ID (ownership verification)
   *
   * @param id - The connection's unique identifier
   * @param userId - The user's unique identifier
   * @returns Promise resolving to connection or null if not found
   */
  async findFirstByUserAndId(
    id: string,
    userId: string
  ): Promise<ApiConnection | null> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findFirst({
          where: {
            id,
            userId,
          },
        }),
      this.buildErrorMessage("find", "connection", `${id} for user ${userId}`)
    );
  }

  /**
   * Find a connection by ID with credentials (for health check execution)
   *
   * @param id - The connection's unique identifier
   * @returns Promise resolving to connection with credentials or null if not found
   */
  async findByIdWithCredentials(id: string): Promise<{
    id: string;
    name: string;
    provider: string;
    baseUrl: string;
    apiKey: string;
    secretKey: string | null;
    accountSid: string | null;
    authToken: string | null;
    token: string | null;
  } | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            provider: true,
            baseUrl: true,
            apiKey: true,
            secretKey: true,
            accountSid: true,
            authToken: true,
            token: true,
          },
        }),
      this.buildErrorMessage("find", "connection with credentials", id)
    );
  }

  /**
   * Update a connection by ID
   *
   * @param id - The connection's unique identifier
   * @param data - Data to update
   * @returns Promise resolving to the updated connection
   */
  async update(
    id: string,
    data: Prisma.ApiConnectionUpdateInput
  ): Promise<ApiConnection> {
    this.validateRequiredParams({ id, data }, ["id", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "connection", id)
    );
  }

  /**
   * Delete a connection by ID
   *
   * @param id - The connection's unique identifier
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    this.validateRequiredParams({ id }, ["id"]);

    await this.executeQuery(
      async () =>
        this.prisma.apiConnection.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "connection", id)
    );
  }
}
