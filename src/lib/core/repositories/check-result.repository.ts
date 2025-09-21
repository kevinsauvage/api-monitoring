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
    return this.executeQuery(
      async () =>
        this.prisma.checkResult.create({
          data,
        }),
      this.buildErrorMessage("create", "check result")
    );
  }
}
