import type { CheckResult, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CheckResultWithDetails = Prisma.CheckResultGetPayload<{
  include: {
    healthCheck: {
      select: {
        id: true;
        endpoint: true;
        method: true;
        apiConnection: {
          select: {
            name: true;
            provider: true;
          };
        };
      };
    };
  };
}>;

export class CheckResultRepository extends BaseRepository {
  /**
   * Find check results for a user with detailed information
   *
   * @param userId - The user's unique identifier
   * @param limit - Maximum number of results to return (default: 50)
   * @returns Promise resolving to array of check results with details
   */
  async findByUserIdWithDetails(
    userId: string,
    limit = 50
  ): Promise<CheckResultWithDetails[]> {
    this.validateRequiredParams({ userId, limit }, ["userId", "limit"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findMany({
          where: {
            healthCheck: {
              apiConnection: {
                userId,
              },
            },
          },
          orderBy: { timestamp: "desc" },
          take: limit,
          include: {
            healthCheck: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                apiConnection: {
                  select: {
                    name: true,
                    provider: true,
                  },
                },
              },
            },
          },
        }),
      this.buildErrorMessage("find", "check results for user", userId)
    );
  }

  /**
   * Find check results for a connection with detailed information
   *
   * @param connectionId - The connection's unique identifier
   * @param limit - Maximum number of results to return (default: 100)
   * @returns Promise resolving to array of check results with details
   */
  async findByConnectionId(
    connectionId: string,
    limit = 100
  ): Promise<CheckResultWithDetails[]> {
    this.validateRequiredParams({ connectionId, limit }, [
      "connectionId",
      "limit",
    ]);
    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findMany({
          where: {
            healthCheck: {
              apiConnectionId: connectionId,
            },
          },
          orderBy: { timestamp: "desc" },
          take: limit,
          include: {
            healthCheck: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                apiConnection: {
                  select: {
                    name: true,
                    provider: true,
                  },
                },
              },
            },
          },
        }),
      this.buildErrorMessage(
        "find",
        "check results for connection",
        connectionId
      )
    );
  }

  /**
   * Find check results for a specific health check
   *
   * @param healthCheckId - The health check's unique identifier
   * @param limit - Maximum number of results to return (default: 10)
   * @returns Promise resolving to array of check results
   */
  async findByHealthCheckId(
    healthCheckId: string,
    limit = 10
  ): Promise<CheckResult[]> {
    this.validateRequiredParams({ healthCheckId, limit }, [
      "healthCheckId",
      "limit",
    ]);
    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findMany({
          where: {
            healthCheckId,
          },
          orderBy: { timestamp: "desc" },
          take: limit,
        }),
      this.buildErrorMessage(
        "find",
        "check results for health check",
        healthCheckId
      )
    );
  }

  /**
   * Create a new check result
   *
   * @param data - Check result creation data
   * @returns Promise resolving to the created check result
   */
  async create(data: Prisma.CheckResultCreateInput): Promise<CheckResult> {
    this.validateRequiredParams(data, [
      "healthCheckId",
      "status",
      "responseTime",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.create({
          data,
        }),
      this.buildErrorMessage("create", "check result")
    );
  }

  /**
   * Find a check result by ID
   *
   * @param id - The check result's unique identifier
   * @returns Promise resolving to check result or null if not found
   */
  async findById(id: string): Promise<CheckResult | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findUnique({
          where: { id },
        }),
      this.buildErrorMessage("find", "check result", id)
    );
  }

  /**
   * Update a check result by ID
   *
   * @param id - The check result's unique identifier
   * @param data - Data to update
   * @returns Promise resolving to the updated check result
   */
  async update(
    id: string,
    data: Prisma.CheckResultUpdateInput
  ): Promise<CheckResult> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "check result", id)
    );
  }

  /**
   * Delete a check result by ID
   *
   * @param id - The check result's unique identifier
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    this.validateRequiredParams({ id }, ["id"]);

    await this.executeQuery(
      async () =>
        this.prisma.checkResult.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "check result", id)
    );
  }

  /**
   * Delete multiple check results matching the criteria
   *
   * @param where - Criteria to match check results
   * @returns Promise resolving to deletion count
   */
  async deleteMany(
    where: Prisma.CheckResultWhereInput
  ): Promise<{ count: number }> {
    return this.executeQuery(
      async () =>
        this.prisma.checkResult.deleteMany({
          where,
        }),
      this.buildErrorMessage("delete", "multiple check results")
    );
  }

  /**
   * Count check results for a user
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to check result count
   */
  async countByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.count({
          where: {
            healthCheck: {
              apiConnection: {
                userId,
              },
            },
          },
        }),
      this.buildErrorMessage("count", "check results for user", userId)
    );
  }

  /**
   * Find check results with pagination
   *
   * @param userId - The user's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated check results
   */
  async findByUserIdPaginated(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: CheckResultWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    this.validateRequiredParams({ userId, page, limit }, ["userId"]);

    return this.executePaginated(
      async () => this.findByUserIdWithDetails(userId, limit * 10), // Get more data for accurate pagination
      page,
      limit,
      this.buildErrorMessage("find", "check results for user", userId)
    );
  }
}
